# Stoneale Soroban contracts

| Contract | What it does |
| --- | --- |
| `contracts/rewards` | **STONE reward points.** Approved minters (game servers) `award` points to players, and players `redeem` them for perks. `award_once` takes a 32-byte reference (the site uses the payment's transaction hash) and refuses to award the same reference twice. Points can't be transferred. The admin manages minters and can `upgrade` the contract. |
| `contracts/achievements` | **Achievement badges (soulbound NFTs).** The admin defines achievements (name, rarity, metadata URI). Approved issuers `mint` one badge per player per achievement. Badges can't be transferred. |
| `contracts/tournaments` | **Tournament escrow.** Organizers `create` a named tournament for a game with an entry fee in any Stellar token (XLM or USDC through their Stellar Asset Contract) and a prize split in basis points. Players `join` (paying the fee into escrow) and can `leave` for a refund until the organizer calls `start`. Then `finish` pays the winners, or `cancel` refunds everyone. There's no admin and no upgrade path, so escrowed funds can only move by these rules. |

The organizer reports tournament results, so players must trust them, as with any off-chain game. Stoneale should be the organizer for official tournaments.

## Requirements

- Rust with the `wasm32v1-none` target: `rustup target add wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) 28+

On Windows without Visual Studio Build Tools, the `x86_64-pc-windows-gnu` Rust toolchain works.

## Build and test

```sh
cd soroban
cargo test              # host tests for all contracts
stellar contract build  # wasm in target/wasm32v1-none/release/
```

## Testnet deployment

| Contract | Contract ID |
| --- | --- |
| rewards | `CCHSCXH2TGCIDO5HLFQLMJK7LME4ZZZWK57RZ2LMEOKLLIZ5EAJGD7PS` |
| achievements | `CBMB32CQYIEAJJ56LTZNXX4Q7P4JYKQEKIVV3IPBZWJ6QZFYVWI66YLQ` |
| tournaments | `CAAT4NLDA5XRBVJEGEG6VHDMHPVYD2DHDSSNR57L22KICLIFX3Z2DXUU` |

The rewards contract was upgraded in place (through `upgrade`) to add `award_once`. Tournaments can't be upgraded, so the version with names was deployed fresh. The admin, minter and issuer is the dev key `GC6LBLDNHI5KD3KHURUFBRD33FVFJITD7GBPIGZ7TJASI25FWKK4XJYU`, which exists only on the machine that deployed them. For mainnet, deploy fresh contracts with a dedicated admin key, ideally a multisig account.

```sh
stellar contract deploy --wasm target/wasm32v1-none/release/rewards.wasm \
  --source-account <identity> --network testnet -- --admin <ADMIN_ADDRESS>
stellar contract invoke --id <CONTRACT_ID> --network testnet -- --help
```

## Using the contracts from the site

- `lib/stellar/contract-specs.ts` embeds each contract's interface. After changing a contract, rebuild it and run `pnpm contracts:specs`.
- `lib/stellar/contracts.ts` handles reads, and calls players sign with Freighter, such as joining a tournament.
- `lib/stellar/admin.ts` runs server-side calls signed with `STELLAR_ADMIN_SECRET`: minting badges, and awarding STONE for verified purchases.
