#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, BytesN, Env};

fn setup() -> (Env, RewardsClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let minter = Address::generate(&env);
    let contract_id = env.register(Rewards, (&admin,));
    let client = RewardsClient::new(&env, &contract_id);
    client.set_minter(&minter, &true);
    (env, client, admin, minter)
}

#[test]
fn award_and_redeem() {
    let (env, client, _, minter) = setup();
    let player = Address::generate(&env);

    assert_eq!(
        client.award(&minter, &player, &100, &symbol_short!("chess")),
        100
    );
    assert_eq!(env.auths()[0].0, minter);
    assert_eq!(
        client.award(&minter, &player, &50, &symbol_short!("streak")),
        150
    );
    assert_eq!(client.total_supply(), 150);

    assert_eq!(client.redeem(&player, &60, &symbol_short!("theme")), 90);
    assert_eq!(env.auths()[0].0, player);
    assert_eq!(client.balance(&player), 90);
    assert_eq!(client.total_supply(), 90);
}

#[test]
fn only_minters_can_award() {
    let (env, client, _, minter) = setup();
    let stranger = Address::generate(&env);
    let player = Address::generate(&env);

    assert_eq!(
        client.try_award(&stranger, &player, &10, &symbol_short!("chess")),
        Err(Ok(Error::NotMinter))
    );

    client.set_minter(&minter, &false);
    assert!(!client.is_minter(&minter));
    assert_eq!(
        client.try_award(&minter, &player, &10, &symbol_short!("chess")),
        Err(Ok(Error::NotMinter))
    );
}

#[test]
fn rejects_bad_amounts() {
    let (env, client, _, minter) = setup();
    let player = Address::generate(&env);

    assert_eq!(
        client.try_award(&minter, &player, &0, &symbol_short!("chess")),
        Err(Ok(Error::InvalidAmount))
    );
    assert_eq!(
        client.try_award(&minter, &player, &-5, &symbol_short!("chess")),
        Err(Ok(Error::InvalidAmount))
    );
    client.award(&minter, &player, &10, &symbol_short!("chess"));
    assert_eq!(
        client.try_redeem(&player, &11, &symbol_short!("theme")),
        Err(Ok(Error::InsufficientBalance))
    );
    assert_eq!(
        client.try_redeem(&player, &0, &symbol_short!("theme")),
        Err(Ok(Error::InvalidAmount))
    );
}

#[test]
fn admin_actions_need_admin_auth() {
    let (env, client, admin, _) = setup();
    let new_minter = Address::generate(&env);

    client.set_minter(&new_minter, &true);
    assert_eq!(env.auths()[0].0, admin);

    let new_admin = Address::generate(&env);
    client.set_admin(&new_admin);
    assert_eq!(client.admin(), new_admin);
}

#[test]
#[should_panic]
fn set_minter_fails_without_auth() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let contract_id = env.register(Rewards, (&admin,));
    let client = RewardsClient::new(&env, &contract_id);
    client.set_minter(&Address::generate(&env), &true);
}

#[test]
fn award_once_per_reference() {
    let (env, client, _, minter) = setup();
    let player = Address::generate(&env);
    let payment = BytesN::from_array(&env, &[7; 32]);

    assert!(!client.is_awarded(&payment));
    assert_eq!(
        client.award_once(&minter, &player, &50, &symbol_short!("purchase"), &payment),
        50
    );
    assert!(client.is_awarded(&payment));
    assert_eq!(
        client.try_award_once(&minter, &player, &50, &symbol_short!("purchase"), &payment),
        Err(Ok(Error::AlreadyAwarded))
    );
    assert_eq!(client.balance(&player), 50);

    // A rejected award doesn't use up the reference
    let other = BytesN::from_array(&env, &[8; 32]);
    let stranger = Address::generate(&env);
    assert_eq!(
        client.try_award_once(&stranger, &player, &50, &symbol_short!("purchase"), &other),
        Err(Ok(Error::NotMinter))
    );
    assert!(!client.is_awarded(&other));
}
