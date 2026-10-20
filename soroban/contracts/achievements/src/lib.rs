#![no_std]

//! Achievement badges (soulbound NFTs).
//!
//! The admin defines achievements such as "Chess Master". Approved issuers
//! (Stoneale's servers) mint a badge to a player once they've earned it. Each
//! player can hold at most one badge per achievement, and badges can't be
//! transferred: they're proof of the holder's own progress.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN,
    ContractExecutable, Env, String, Symbol,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const TTL_EXTEND_TO: u32 = 120 * DAY_IN_LEDGERS;
const TTL_THRESHOLD: u32 = TTL_EXTEND_TO - 30 * DAY_IN_LEDGERS;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotIssuer = 1,
    UnknownAchievement = 2,
    AchievementExists = 3,
    AlreadyOwned = 4,
    UnknownBadge = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Achievement {
    pub name: String,
    pub rarity: Symbol,
    pub metadata_uri: String,
    pub minted: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Badge {
    pub owner: Address,
    pub achievement_id: u32,
    pub minted_at: u64,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    BadgeCount,
    Issuer(Address),
    Achievement(u32),
    Badge(u64),
    // Badge id owned by (player, achievement id)
    Owned(Address, u32),
    Balance(Address),
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AchievementDefined {
    #[topic]
    pub achievement_id: u32,
    pub name: String,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeMinted {
    #[topic]
    pub to: Address,
    #[topic]
    pub achievement_id: u32,
    pub badge_id: u64,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct IssuerUpdated {
    #[topic]
    pub issuer: Address,
    pub enabled: bool,
}

#[contract]
pub struct Achievements;

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

fn write_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(
    env: &Env,
    key: &DataKey,
    value: &V,
) {
    env.storage().persistent().set(key, value);
    env.storage()
        .persistent()
        .extend_ttl(key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

#[contractimpl]
impl Achievements {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BadgeCount, &0u64);
    }

    pub fn admin(env: Env) -> Address {
        admin(&env)
    }

    pub fn set_admin(env: Env, new_admin: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        bump_instance(&env);
    }

    pub fn set_issuer(env: Env, issuer: Address, enabled: bool) {
        require_admin(&env);
        let key = DataKey::Issuer(issuer.clone());
        if enabled {
            write_persistent(&env, &key, &true);
        } else {
            env.storage().persistent().remove(&key);
        }
        bump_instance(&env);
        IssuerUpdated { issuer, enabled }.publish(&env);
    }

    pub fn is_issuer(env: Env, issuer: Address) -> bool {
        env.storage().persistent().has(&DataKey::Issuer(issuer))
    }

    pub fn define_achievement(
        env: Env,
        achievement_id: u32,
        name: String,
        rarity: Symbol,
        metadata_uri: String,
    ) -> Result<(), Error> {
        require_admin(&env);
        let key = DataKey::Achievement(achievement_id);
        if env.storage().persistent().has(&key) {
            return Err(Error::AchievementExists);
        }
        let achievement = Achievement {
            name: name.clone(),
            rarity,
            metadata_uri,
            minted: 0,
        };
        write_persistent(&env, &key, &achievement);
        bump_instance(&env);
        AchievementDefined {
            achievement_id,
            name,
        }
        .publish(&env);
        Ok(())
    }

    pub fn set_metadata_uri(
        env: Env,
        achievement_id: u32,
        metadata_uri: String,
    ) -> Result<(), Error> {
        require_admin(&env);
        let mut achievement = Self::achievement(env.clone(), achievement_id)?;
        achievement.metadata_uri = metadata_uri;
        write_persistent(&env, &DataKey::Achievement(achievement_id), &achievement);
        Ok(())
    }

    /// Mints the badge for `achievement_id` to `to`. Returns the new badge id.
    pub fn mint(env: Env, issuer: Address, to: Address, achievement_id: u32) -> Result<u64, Error> {
        issuer.require_auth();
        if !Self::is_issuer(env.clone(), issuer) {
            return Err(Error::NotIssuer);
        }
        let mut achievement = Self::achievement(env.clone(), achievement_id)?;
        let owned_key = DataKey::Owned(to.clone(), achievement_id);
        if env.storage().persistent().has(&owned_key) {
            return Err(Error::AlreadyOwned);
        }

        let badge_id: u64 = env
            .storage()
            .instance()
            .get::<_, u64>(&DataKey::BadgeCount)
            .unwrap()
            + 1;
        env.storage()
            .instance()
            .set(&DataKey::BadgeCount, &badge_id);
        bump_instance(&env);

        let badge = Badge {
            owner: to.clone(),
            achievement_id,
            minted_at: env.ledger().timestamp(),
        };
        write_persistent(&env, &DataKey::Badge(badge_id), &badge);
        write_persistent(&env, &owned_key, &badge_id);
        write_persistent(
            &env,
            &DataKey::Balance(to.clone()),
            &(Self::balance(env.clone(), to.clone()) + 1),
        );

        achievement.minted += 1;
        write_persistent(&env, &DataKey::Achievement(achievement_id), &achievement);

        BadgeMinted {
            to,
            achievement_id,
            badge_id,
        }
        .publish(&env);
        Ok(badge_id)
    }

    pub fn achievement(env: Env, achievement_id: u32) -> Result<Achievement, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Achievement(achievement_id))
            .ok_or(Error::UnknownAchievement)
    }

    pub fn badge(env: Env, badge_id: u64) -> Result<Badge, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Badge(badge_id))
            .ok_or(Error::UnknownBadge)
    }

    /// The id of the badge `owner` holds for `achievement_id`, if any
    pub fn badge_of(env: Env, owner: Address, achievement_id: u32) -> Option<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::Owned(owner, achievement_id))
    }

    pub fn balance(env: Env, owner: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(owner))
            .unwrap_or(0)
    }

    pub fn total_badges(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::BadgeCount)
            .unwrap_or(0)
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        require_admin(&env);
        env.deployer()
            .update_current_contract(ContractExecutable::Wasm(new_wasm_hash));
    }
}

mod test;
