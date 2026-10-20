#![no_std]

//! Tournament escrow.
//!
//! An organizer creates a tournament with an entry fee in any Stellar token
//! (XLM or USDC through their Stellar Asset Contracts). Players' fees are held
//! by this contract until the organizer reports the winners, who are paid by
//! the prize split fixed at creation. If the tournament is cancelled, every
//! player is refunded. The contract has no admin and can't be upgraded, so
//! escrowed funds can only move by these rules.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env, Vec,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const TTL_EXTEND_TO: u32 = 120 * DAY_IN_LEDGERS;
const TTL_THRESHOLD: u32 = TTL_EXTEND_TO - 30 * DAY_IN_LEDGERS;

const BPS_TOTAL: u32 = 10_000;
// Bounds keep each tournament's storage entry and payout loop small
const MAX_PLAYERS: u32 = 128;
const MAX_PRIZES: u32 = 10;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidConfig = 1,
    NotFound = 2,
    NotOpen = 3,
    Full = 4,
    AlreadyJoined = 5,
    NotJoined = 6,
    NotLive = 7,
    NotEnoughPlayers = 8,
    InvalidWinners = 9,
    AlreadyClosed = 10,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Status {
    Open,
    Live,
    Finished,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Tournament {
    pub organizer: Address,
    pub token: Address,
    pub entry_fee: i128,
    pub max_players: u32,
    // Share of the prize pool for 1st, 2nd, ... place in basis points; sums to 10,000
    pub prize_split_bps: Vec<u32>,
    pub players: Vec<Address>,
    pub prize_pool: i128,
    pub status: Status,
    pub winners: Vec<Address>,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Count,
    Tournament(u64),
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Created {
    #[topic]
    pub tournament_id: u64,
    #[topic]
    pub organizer: Address,
    pub token: Address,
    pub entry_fee: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Joined {
    #[topic]
    pub tournament_id: u64,
    #[topic]
    pub player: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Left {
    #[topic]
    pub tournament_id: u64,
    #[topic]
    pub player: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Started {
    #[topic]
    pub tournament_id: u64,
    pub players: u32,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PrizePaid {
    #[topic]
    pub tournament_id: u64,
    #[topic]
    pub winner: Address,
    pub place: u32,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Cancelled {
    #[topic]
    pub tournament_id: u64,
    pub refunded: u32,
}

#[contract]
pub struct Tournaments;

fn load(env: &Env, id: u64) -> Result<Tournament, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Tournament(id))
        .ok_or(Error::NotFound)
}

fn save(env: &Env, id: u64, tournament: &Tournament) {
    let key = DataKey::Tournament(id);
    env.storage().persistent().set(&key, tournament);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

fn pay(env: &Env, tournament: &Tournament, to: &Address, amount: i128) {
    if amount > 0 {
        token::TokenClient::new(env, &tournament.token).transfer(
            &env.current_contract_address(),
            to,
            &amount,
        );
    }
}

#[contractimpl]
impl Tournaments {
    /// Creates a tournament and returns its id.
    pub fn create(
        env: Env,
        organizer: Address,
        token: Address,
        entry_fee: i128,
        max_players: u32,
        prize_split_bps: Vec<u32>,
    ) -> Result<u64, Error> {
        organizer.require_auth();

        let prizes = prize_split_bps.len();
        if entry_fee < 0
            || max_players < 2
            || max_players > MAX_PLAYERS
            || prizes == 0
            || prizes > MAX_PRIZES
            || prizes > max_players
        {
            return Err(Error::InvalidConfig);
        }
        let mut total_bps: u32 = 0;
        for bps in prize_split_bps.iter() {
            if bps == 0 {
                return Err(Error::InvalidConfig);
            }
            total_bps += bps;
        }
        if total_bps != BPS_TOTAL {
            return Err(Error::InvalidConfig);
        }

        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0u64)
            + 1;
        env.storage().instance().set(&DataKey::Count, &id);
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);

        let tournament = Tournament {
            organizer: organizer.clone(),
            token: token.clone(),
            entry_fee,
            max_players,
            prize_split_bps,
            players: Vec::new(&env),
            prize_pool: 0,
            status: Status::Open,
            winners: Vec::new(&env),
        };
        save(&env, id, &tournament);

        Created {
            tournament_id: id,
            organizer,
            token,
            entry_fee,
        }
        .publish(&env);
        Ok(id)
    }

    /// Pays the entry fee into escrow and registers `player`.
    pub fn join(env: Env, player: Address, tournament_id: u64) -> Result<(), Error> {
        player.require_auth();
        let mut t = load(&env, tournament_id)?;
        if t.status != Status::Open {
            return Err(Error::NotOpen);
        }
        if t.players.contains(&player) {
            return Err(Error::AlreadyJoined);
        }
        if t.players.len() >= t.max_players {
            return Err(Error::Full);
        }

        t.players.push_back(player.clone());
        t.prize_pool += t.entry_fee;
        save(&env, tournament_id, &t);

        if t.entry_fee > 0 {
            token::TokenClient::new(&env, &t.token).transfer(
                &player,
                &env.current_contract_address(),
                &t.entry_fee,
            );
        }

        Joined {
            tournament_id,
            player,
        }
        .publish(&env);
        Ok(())
    }

    /// Withdraws `player` before the tournament starts and refunds their fee.
    pub fn leave(env: Env, player: Address, tournament_id: u64) -> Result<(), Error> {
        player.require_auth();
        let mut t = load(&env, tournament_id)?;
        if t.status != Status::Open {
            return Err(Error::NotOpen);
        }
        let index = t.players.first_index_of(&player).ok_or(Error::NotJoined)?;

        t.players.remove(index);
        t.prize_pool -= t.entry_fee;
        save(&env, tournament_id, &t);
        pay(&env, &t, &player, t.entry_fee);

        Left {
            tournament_id,
            player,
        }
        .publish(&env);
        Ok(())
    }

    /// Closes registration. Needs at least as many players as prizes, and two minimum.
    pub fn start(env: Env, tournament_id: u64) -> Result<(), Error> {
        let mut t = load(&env, tournament_id)?;
        t.organizer.require_auth();
        if t.status != Status::Open {
            return Err(Error::NotOpen);
        }
        let players = t.players.len();
        if players < 2 || players < t.prize_split_bps.len() {
            return Err(Error::NotEnoughPlayers);
        }

        t.status = Status::Live;
        save(&env, tournament_id, &t);

        Started {
            tournament_id,
            players,
        }
        .publish(&env);
        Ok(())
    }

    /// Reports the final standings (1st place first) and pays out the prize pool.
    pub fn finish(env: Env, tournament_id: u64, winners: Vec<Address>) -> Result<(), Error> {
        let mut t = load(&env, tournament_id)?;
        t.organizer.require_auth();
        if t.status != Status::Live {
            return Err(Error::NotLive);
        }
        if winners.len() != t.prize_split_bps.len() {
            return Err(Error::InvalidWinners);
        }
        for (i, winner) in winners.iter().enumerate() {
            let duplicate = winners.first_index_of(&winner) != Some(i as u32);
            if duplicate || !t.players.contains(&winner) {
                return Err(Error::InvalidWinners);
            }
        }

        let pool = t.prize_pool;
        let mut amounts: Vec<i128> = Vec::new(&env);
        let mut distributed: i128 = 0;
        for bps in t.prize_split_bps.iter() {
            let amount = pool * bps as i128 / BPS_TOTAL as i128;
            amounts.push_back(amount);
            distributed += amount;
        }
        // Rounding dust goes to the winner
        let first = amounts.get_unchecked(0) + (pool - distributed);
        amounts.set(0, first);

        t.status = Status::Finished;
        t.winners = winners.clone();
        save(&env, tournament_id, &t);

        for (i, winner) in winners.iter().enumerate() {
            let amount = amounts.get_unchecked(i as u32);
            pay(&env, &t, &winner, amount);
            PrizePaid {
                tournament_id,
                winner,
                place: i as u32 + 1,
                amount,
            }
            .publish(&env);
        }
        Ok(())
    }

    /// Cancels the tournament and refunds every player's entry fee.
    pub fn cancel(env: Env, tournament_id: u64) -> Result<(), Error> {
        let mut t = load(&env, tournament_id)?;
        t.organizer.require_auth();
        if t.status != Status::Open && t.status != Status::Live {
            return Err(Error::AlreadyClosed);
        }

        t.status = Status::Cancelled;
        save(&env, tournament_id, &t);

        for player in t.players.iter() {
            pay(&env, &t, &player, t.entry_fee);
        }

        Cancelled {
            tournament_id,
            refunded: t.players.len(),
        }
        .publish(&env);
        Ok(())
    }

    pub fn tournament(env: Env, tournament_id: u64) -> Result<Tournament, Error> {
        load(&env, tournament_id)
    }

    pub fn count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }
}

mod test;
