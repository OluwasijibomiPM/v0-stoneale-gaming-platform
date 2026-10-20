#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    symbol_short, testutils::Address as _, token::StellarAssetClient, token::TokenClient, vec, Env,
};

struct Setup {
    env: Env,
    client: TournamentsClient<'static>,
    token: TokenClient<'static>,
    organizer: Address,
    players: std::vec::Vec<Address>,
}

fn setup(player_count: usize) -> Setup {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let sac = env.register_stellar_asset_contract_v2(token_admin);
    let token = TokenClient::new(&env, &sac.address());
    let minter = StellarAssetClient::new(&env, &sac.address());

    let players = (0..player_count)
        .map(|_| {
            let p = Address::generate(&env);
            minter.mint(&p, &1_000);
            p
        })
        .collect();

    let contract_id = env.register(Tournaments, ());
    let client = TournamentsClient::new(&env, &contract_id);
    Setup {
        organizer: Address::generate(&env),
        env,
        client,
        token,
        players,
    }
}

fn create(s: &Setup, entry_fee: i128, max_players: u32, split: Vec<u32>) -> u64 {
    s.client.create(
        &s.organizer,
        &String::from_str(&s.env, "Weekly Chess Cup"),
        &symbol_short!("chess"),
        &s.token.address,
        &entry_fee,
        &max_players,
        &split,
    )
}

#[test]
fn full_tournament_pays_winners() {
    let s = setup(3);
    let id = create(&s, 100, 8, vec![&s.env, 7_000, 3_000]);

    for p in &s.players {
        s.client.join(p, &id);
        assert_eq!(s.env.auths()[0].0, *p);
    }
    assert_eq!(s.token.balance(&s.client.address), 300);

    s.client.start(&id);
    assert_eq!(s.env.auths()[0].0, s.organizer);
    s.client.finish(
        &id,
        &vec![&s.env, s.players[2].clone(), s.players[0].clone()],
    );

    assert_eq!(s.token.balance(&s.players[2]), 900 + 210);
    assert_eq!(s.token.balance(&s.players[0]), 900 + 90);
    assert_eq!(s.token.balance(&s.players[1]), 900);
    assert_eq!(s.token.balance(&s.client.address), 0);

    let t = s.client.tournament(&id);
    assert_eq!(t.name, String::from_str(&s.env, "Weekly Chess Cup"));
    assert_eq!(t.game, symbol_short!("chess"));
    assert_eq!(t.status, Status::Finished);
    assert_eq!(
        t.winners,
        vec![&s.env, s.players[2].clone(), s.players[0].clone()]
    );
}

#[test]
fn rounding_dust_goes_to_first_place() {
    let s = setup(3);
    let id = create(&s, 1, 3, vec![&s.env, 3_333, 3_333, 3_334]);
    for p in &s.players {
        s.client.join(p, &id);
    }
    s.client.start(&id);
    s.client.finish(
        &id,
        &vec![
            &s.env,
            s.players[0].clone(),
            s.players[1].clone(),
            s.players[2].clone(),
        ],
    );

    // Pool of 3: shares round down to 0, 0, 1 and the leftover 2 go to 1st place
    assert_eq!(s.token.balance(&s.players[0]), 999 + 2);
    assert_eq!(s.token.balance(&s.players[1]), 999);
    assert_eq!(s.token.balance(&s.players[2]), 999 + 1);
    assert_eq!(s.token.balance(&s.client.address), 0);
}

#[test]
fn leave_and_cancel_refund() {
    let s = setup(3);
    let id = create(&s, 100, 8, vec![&s.env, 10_000]);
    for p in &s.players {
        s.client.join(p, &id);
    }

    s.client.leave(&s.players[0], &id);
    assert_eq!(s.token.balance(&s.players[0]), 1_000);
    assert_eq!(s.client.tournament(&id).prize_pool, 200);

    s.client.start(&id);
    s.client.cancel(&id);
    assert_eq!(s.token.balance(&s.players[1]), 1_000);
    assert_eq!(s.token.balance(&s.players[2]), 1_000);
    assert_eq!(s.token.balance(&s.client.address), 0);
    assert_eq!(s.client.tournament(&id).status, Status::Cancelled);
    assert_eq!(s.client.try_cancel(&id), Err(Ok(Error::AlreadyClosed)));
}

#[test]
fn free_tournament() {
    let s = setup(2);
    let id = create(&s, 0, 2, vec![&s.env, 10_000]);
    for p in &s.players {
        s.client.join(p, &id);
    }
    s.client.start(&id);
    s.client.finish(&id, &vec![&s.env, s.players[1].clone()]);
    assert_eq!(s.token.balance(&s.players[1]), 1_000);
}

#[test]
fn rejects_invalid_config() {
    let s = setup(0);
    let bad = [
        (-1, 8, vec![&s.env, 10_000]),
        (100, 1, vec![&s.env, 10_000]),
        (100, 129, vec![&s.env, 10_000]),
        (100, 8, vec![&s.env]),
        (100, 8, vec![&s.env, 5_000, 4_000]),
        (100, 8, vec![&s.env, 10_000, 0]),
        (100, 2, vec![&s.env, 5_000, 3_000, 2_000]),
    ];
    for (fee, max, split) in bad {
        assert_eq!(
            s.client.try_create(
                &s.organizer,
                &String::from_str(&s.env, "Weekly Chess Cup"),
                &symbol_short!("chess"),
                &s.token.address,
                &fee,
                &max,
                &split
            ),
            Err(Ok(Error::InvalidConfig))
        );
    }

    let too_long = String::from_str(&s.env, &"x".repeat(65));
    for name in [String::from_str(&s.env, ""), too_long] {
        assert_eq!(
            s.client.try_create(
                &s.organizer,
                &name,
                &symbol_short!("chess"),
                &s.token.address,
                &100,
                &8,
                &vec![&s.env, 10_000]
            ),
            Err(Ok(Error::InvalidConfig))
        );
    }
}

#[test]
fn registration_rules() {
    let s = setup(3);
    let id = create(&s, 100, 2, vec![&s.env, 10_000]);

    s.client.join(&s.players[0], &id);
    assert_eq!(
        s.client.try_join(&s.players[0], &id),
        Err(Ok(Error::AlreadyJoined))
    );
    assert_eq!(
        s.client.try_leave(&s.players[1], &id),
        Err(Ok(Error::NotJoined))
    );
    assert_eq!(s.client.try_start(&id), Err(Ok(Error::NotEnoughPlayers)));

    s.client.join(&s.players[1], &id);
    assert_eq!(s.client.try_join(&s.players[2], &id), Err(Ok(Error::Full)));

    s.client.start(&id);
    assert_eq!(
        s.client.try_join(&s.players[2], &id),
        Err(Ok(Error::NotOpen))
    );
    assert_eq!(
        s.client.try_leave(&s.players[0], &id),
        Err(Ok(Error::NotOpen))
    );
    assert_eq!(s.client.try_tournament(&99), Err(Ok(Error::NotFound)));
}

#[test]
fn rejects_invalid_winners() {
    let s = setup(3);
    let outsider = Address::generate(&s.env);
    let id = create(&s, 100, 8, vec![&s.env, 7_000, 3_000]);
    assert_eq!(
        s.client.try_finish(
            &id,
            &vec![&s.env, s.players[0].clone(), s.players[1].clone()]
        ),
        Err(Ok(Error::NotLive))
    );

    for p in &s.players {
        s.client.join(p, &id);
    }
    s.client.start(&id);

    let invalid = [
        vec![&s.env, s.players[0].clone()],
        vec![&s.env, s.players[0].clone(), s.players[0].clone()],
        vec![&s.env, s.players[0].clone(), outsider],
    ];
    for winners in invalid {
        assert_eq!(
            s.client.try_finish(&id, &winners),
            Err(Ok(Error::InvalidWinners))
        );
    }
    assert_eq!(s.token.balance(&s.client.address), 300);
}

#[test]
#[should_panic]
fn only_organizer_can_finish() {
    let s = setup(2);
    let id = create(&s, 100, 2, vec![&s.env, 10_000]);
    for p in &s.players {
        s.client.join(p, &id);
    }
    s.client.start(&id);

    // Drop the blanket auth mock: the organizer hasn't signed this call
    s.env.set_auths(&[]);
    s.client.finish(&id, &vec![&s.env, s.players[0].clone()]);
}
