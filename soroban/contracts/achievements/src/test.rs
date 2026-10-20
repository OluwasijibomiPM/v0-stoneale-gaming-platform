#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    Env, String,
};

const CHESS_MASTER: u32 = 1;

fn setup() -> (Env, AchievementsClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let contract_id = env.register(Achievements, (&admin,));
    let client = AchievementsClient::new(&env, &contract_id);
    client.set_issuer(&issuer, &true);
    client.define_achievement(
        &CHESS_MASTER,
        &String::from_str(&env, "Chess Master"),
        &symbol_short!("legendary"),
        &String::from_str(&env, "https://stoneale.app/nfts/chess-master.json"),
    );
    (env, client, admin, issuer)
}

#[test]
fn mint_badge() {
    let (env, client, _, issuer) = setup();
    let player = Address::generate(&env);
    env.ledger().set_timestamp(1_700_000_000);

    let badge_id = client.mint(&issuer, &player, &CHESS_MASTER);
    assert_eq!(env.auths()[0].0, issuer);
    assert_eq!(badge_id, 1);
    assert_eq!(
        client.badge(&badge_id),
        Badge {
            owner: player.clone(),
            achievement_id: CHESS_MASTER,
            minted_at: 1_700_000_000
        }
    );
    assert_eq!(client.badge_of(&player, &CHESS_MASTER), Some(1));
    assert_eq!(client.balance(&player), 1);
    assert_eq!(client.achievement(&CHESS_MASTER).minted, 1);
    assert_eq!(client.total_badges(), 1);
}

#[test]
fn one_badge_per_achievement() {
    let (env, client, _, issuer) = setup();
    let player = Address::generate(&env);
    client.mint(&issuer, &player, &CHESS_MASTER);
    assert_eq!(
        client.try_mint(&issuer, &player, &CHESS_MASTER),
        Err(Ok(Error::AlreadyOwned))
    );

    // Another player can still earn it
    let other = Address::generate(&env);
    assert_eq!(client.mint(&issuer, &other, &CHESS_MASTER), 2);
}

#[test]
fn rejects_unknown_and_unauthorized() {
    let (env, client, _, issuer) = setup();
    let player = Address::generate(&env);
    let stranger = Address::generate(&env);

    assert_eq!(
        client.try_mint(&stranger, &player, &CHESS_MASTER),
        Err(Ok(Error::NotIssuer))
    );
    assert_eq!(
        client.try_mint(&issuer, &player, &99),
        Err(Ok(Error::UnknownAchievement))
    );
    assert_eq!(client.try_badge(&42), Err(Ok(Error::UnknownBadge)));
    assert_eq!(client.badge_of(&player, &CHESS_MASTER), None);

    client.set_issuer(&issuer, &false);
    assert_eq!(
        client.try_mint(&issuer, &player, &CHESS_MASTER),
        Err(Ok(Error::NotIssuer))
    );
}

#[test]
fn achievement_management() {
    let (env, client, admin, _) = setup();
    assert_eq!(
        client.try_define_achievement(
            &CHESS_MASTER,
            &String::from_str(&env, "Duplicate"),
            &symbol_short!("common"),
            &String::from_str(&env, ""),
        ),
        Err(Ok(Error::AchievementExists))
    );

    let uri = String::from_str(&env, "ipfs://new-metadata");
    client.set_metadata_uri(&CHESS_MASTER, &uri);
    assert_eq!(env.auths()[0].0, admin);
    assert_eq!(client.achievement(&CHESS_MASTER).metadata_uri, uri);
}

#[test]
#[should_panic]
fn define_achievement_fails_without_admin_auth() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(Achievements, (&admin,));
    let client = AchievementsClient::new(&env, &contract_id);
    client.define_achievement(
        &1,
        &String::from_str(&env, "Chess Master"),
        &symbol_short!("legendary"),
        &String::from_str(&env, ""),
    );
}
