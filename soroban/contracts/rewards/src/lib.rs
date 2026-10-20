#![no_std]

//! STONE reward points.
//!
//! Approved minters (Stoneale's game servers) award points to players for
//! playing and for wellness milestones. Players spend points on perks. Points
//! are non-transferable, so they can't be bought or farmed between accounts.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN,
    ContractExecutable, Env, Symbol,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const TTL_EXTEND_TO: u32 = 120 * DAY_IN_LEDGERS;
const TTL_THRESHOLD: u32 = TTL_EXTEND_TO - 30 * DAY_IN_LEDGERS;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotMinter = 1,
    InvalidAmount = 2,
    InsufficientBalance = 3,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    TotalSupply,
    Minter(Address),
    Balance(Address),
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Awarded {
    #[topic]
    pub to: Address,
    #[topic]
    pub reason: Symbol,
    pub amount: i128,
    pub minter: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Redeemed {
    #[topic]
    pub from: Address,
    #[topic]
    pub perk: Symbol,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MinterUpdated {
    #[topic]
    pub minter: Address,
    pub enabled: bool,
}

#[contract]
pub struct Rewards;

fn admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn require_admin(env: &Env) {
    admin(env).require_auth();
}

fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

fn write_balance(env: &Env, user: &Address, balance: i128) {
    let key = DataKey::Balance(user.clone());
    env.storage().persistent().set(&key, &balance);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

#[contractimpl]
impl Rewards {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn admin(env: Env) -> Address {
        admin(&env)
    }

    pub fn set_admin(env: Env, new_admin: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        bump_instance(&env);
    }

    pub fn set_minter(env: Env, minter: Address, enabled: bool) {
        require_admin(&env);
        let key = DataKey::Minter(minter.clone());
        if enabled {
            env.storage().persistent().set(&key, &true);
            env.storage()
                .persistent()
                .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        } else {
            env.storage().persistent().remove(&key);
        }
        bump_instance(&env);
        MinterUpdated { minter, enabled }.publish(&env);
    }

    pub fn is_minter(env: Env, minter: Address) -> bool {
        env.storage().persistent().has(&DataKey::Minter(minter))
    }

    /// Awards `amount` points to `to`. Returns the new balance.
    pub fn award(
        env: Env,
        minter: Address,
        to: Address,
        amount: i128,
        reason: Symbol,
    ) -> Result<i128, Error> {
        minter.require_auth();
        if !Self::is_minter(env.clone(), minter.clone()) {
            return Err(Error::NotMinter);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let balance = Self::balance(env.clone(), to.clone()) + amount;
        write_balance(&env, &to, balance);

        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply + amount));
        bump_instance(&env);

        Awarded {
            to,
            reason,
            amount,
            minter,
        }
        .publish(&env);
        Ok(balance)
    }

    /// Spends `amount` of the caller's points on `perk`. Returns the new balance.
    pub fn redeem(env: Env, from: Address, amount: i128, perk: Symbol) -> Result<i128, Error> {
        from.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let balance = Self::balance(env.clone(), from.clone());
        if balance < amount {
            return Err(Error::InsufficientBalance);
        }
        write_balance(&env, &from, balance - amount);

        let supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply - amount));
        bump_instance(&env);

        Redeemed { from, perk, amount }.publish(&env);
        Ok(balance - amount)
    }

    pub fn balance(env: Env, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(user))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        require_admin(&env);
        env.deployer()
            .update_current_contract(ContractExecutable::Wasm(new_wasm_hash));
    }
}

mod test;
