import type { contract } from "@stellar/stellar-sdk"
import { CONTRACT_IDS, STELLAR_NETWORK } from "./config"
import { CONTRACT_SPECS, type ContractName } from "./contract-specs"

export type ContractSigner = {
  publicKey: string
  signTransaction: contract.SignTransaction
}

// Contract methods are generated at runtime from the spec, so they're untyped here
type Invocation = contract.AssembledTransaction<unknown>
type DynamicClient = Record<string, (args?: Record<string, unknown>) => Promise<Invocation>>

export class ContractCallError extends Error {
  constructor(
    message: string,
    // The contract's error code (its `Error` enum value), when it returned one
    public code?: number,
  ) {
    super(message)
  }
}

async function getClient(name: ContractName, signer?: ContractSigner): Promise<DynamicClient> {
  const contractId = CONTRACT_IDS[name]
  if (!contractId || !STELLAR_NETWORK.rpcUrl) {
    throw new ContractCallError(`The ${name} contract isn't configured for ${STELLAR_NETWORK.name}`)
  }
  // The SDK is large, so load it only when a contract is actually used
  const { contract } = await import("@stellar/stellar-sdk")
  const client = new contract.Client(new contract.Spec([...CONTRACT_SPECS[name]]), {
    contractId,
    networkPassphrase: STELLAR_NETWORK.passphrase,
    rpcUrl: STELLAR_NETWORK.rpcUrl,
    ...signer,
  })
  return client as unknown as DynamicClient
}

function checkSimulation(name: ContractName, method: string, tx: Invocation) {
  const error = (tx.simulation as { error?: string } | undefined)?.error
  if (!error) return
  const code = /Error\(Contract, #(\d+)\)/.exec(error)
  throw new ContractCallError(
    code ? `${name}.${method} failed with contract error #${code[1]}` : `${name}.${method} failed: ${error}`,
    code ? Number(code[1]) : undefined,
  )
}

// Contract functions that return a Result come back wrapped in Ok/Err
function unwrap<T>(value: unknown): T {
  if (value && typeof value === "object" && "isErr" in value && "unwrap" in value) {
    const result = value as contract.Result<T>
    if (result.isErr()) throw new ContractCallError(result.unwrapErr().message || "Contract call failed")
    return result.unwrap()
  }
  return value as T
}

/** Simulates a read-only call and returns its result. */
export async function readContract<T>(name: ContractName, method: string, args?: Record<string, unknown>) {
  const tx = await (await getClient(name))[method](args)
  checkSimulation(name, method, tx)
  return unwrap<T>(tx.result)
}

/** Signs a call with `signer`, submits it and waits for its result. */
export async function invokeContract<T>(
  name: ContractName,
  method: string,
  args: Record<string, unknown>,
  signer: ContractSigner,
) {
  const tx = await (await getClient(name, signer))[method](args)
  checkSimulation(name, method, tx)
  const sent = await tx.signAndSend()
  return unwrap<T>(sent.result)
}

// --- Rewards ---

export async function getStoneBalance(address: string): Promise<bigint> {
  return readContract<bigint>("rewards", "balance", { user: address })
}

// --- Achievements ---

/** Badge id held by `address` for each achievement, or null if not minted. */
export async function getBadgeIds(address: string, achievementIds: number[]) {
  const ids = await Promise.all(
    achievementIds.map((id) =>
      readContract<bigint | null | undefined>("achievements", "badge_of", { owner: address, achievement_id: id }),
    ),
  )
  return Object.fromEntries(achievementIds.map((id, i) => [id, ids[i] == null ? null : Number(ids[i])])) as Record<
    number,
    number | null
  >
}

// --- Tournaments ---

export type TournamentStatus = "Open" | "Live" | "Finished" | "Cancelled"

export type Tournament = {
  id: number
  name: string
  game: string
  organizer: string
  token: string
  entryFee: bigint
  maxPlayers: number
  prizeSplitBps: number[]
  players: string[]
  prizePool: bigint
  status: TournamentStatus
  winners: string[]
}

type RawTournament = {
  name: string
  game: string
  organizer: string
  token: string
  entry_fee: bigint
  max_players: number
  prize_split_bps: number[]
  players: string[]
  prize_pool: bigint
  status: { tag: TournamentStatus }
  winners: string[]
}

export const TOURNAMENT_ERRORS: Record<number, string> = {
  3: "Registration for this tournament is closed",
  4: "This tournament is full",
  5: "You've already joined this tournament",
  6: "You haven't joined this tournament",
}

export async function getTournaments(): Promise<Tournament[]> {
  const count = Number(await readContract<bigint>("tournaments", "count"))
  const ids = Array.from({ length: count }, (_, i) => count - i)
  const raw = await Promise.all(
    ids.map((id) => readContract<RawTournament>("tournaments", "tournament", { tournament_id: BigInt(id) })),
  )
  return raw.map((t, i) => ({
    id: ids[i],
    name: t.name,
    game: t.game,
    organizer: t.organizer,
    token: t.token,
    entryFee: t.entry_fee,
    maxPlayers: t.max_players,
    prizeSplitBps: t.prize_split_bps,
    players: t.players,
    prizePool: t.prize_pool,
    status: t.status.tag,
    winners: t.winners,
  }))
}

export async function joinTournament(tournamentId: number, signer: ContractSigner) {
  await invokeContract("tournaments", "join", { player: signer.publicKey, tournament_id: BigInt(tournamentId) }, signer)
}

export async function leaveTournament(tournamentId: number, signer: ContractSigner) {
  await invokeContract("tournaments", "leave", { player: signer.publicKey, tournament_id: BigInt(tournamentId) }, signer)
}
