use std::{sync::{atomic::AtomicUsize, Arc}, collections::HashMap, str::FromStr};

use tokio::{sync::mpsc::{Receiver, Sender}, task::JoinHandle};
use crate::{game_comms::{GameComms, GameInstanceMessage, GameSender}, game::{GameStub, spawn_new_game}};
use log::error;

struct GameInfo {
    game_id: usize,
    tx: GameSender,
    stub: GameStub,
}

async fn game_instance_manager(mut comms: GameComms) {
    error!("[GIM]: top of function?");
    let (tx_game, mut rx_game) = tokio::sync::mpsc::channel::<GameInstanceMessage>(100);

    let mut current_game: Option<GameInfo> = None;
    let mut game_id = 0;
    let mut running_games: HashMap<usize, GameInfo> = HashMap::new();

    loop {
        error!("[GIM] loop");
        let msg = tokio::select! {
            msg = comms.receiver.recv() => {
                error!("Help me?");
                if msg.is_none() {
                    error!("game instance manager channel has been closed.  Closing down server.");
                    break;
                }

                msg
            }
            msg = rx_game.recv() => { msg }
        };

        error!("[GIM] msg received {:?}", msg);
        let msg = match msg {
            Some(msg) => msg,
            None => {
                error!("[GIM] continue");
                continue;
            }
        };

        match msg {
            GameInstanceMessage::Msg(_) => unreachable!("the GIM should never get a game message"),

            GameInstanceMessage::Connection(stream, sink) => {
                if current_game.is_none() {
                    let (comms, tx) = GameComms::with_sender(tx_game.clone());

                    game_id += 1;
                    let stub = spawn_new_game(game_id, comms);

                    current_game = Some(GameInfo {
                        game_id,
                        stub,
                        tx,
                    });
                }

                match &mut current_game {
                    Some(info) =>  {
                        error!("current_game {}, sending sink", info.game_id);
                        _ = info.tx.send(GameInstanceMessage::Connection(stream, sink)).await;
                    }
                    None => unreachable!("current game is none, that should never happen here"),
                }
            },

            GameInstanceMessage::StartGame(game_id) => {
                let info = current_game
                    .take()
                    .expect("there should always be a current game when a start game command happens");

                if info.game_id != game_id {
                    error!("there is an id mismatch between the game and start command {} != {}", info.game_id, game_id);
                }

                running_games.insert(info.game_id, info);
            },

            GameInstanceMessage::EndGame(_) => todo!(),

            GameInstanceMessage::PlayerConnectionFailed(_) => unreachable!("player connection failed was received by GIM"),
        }
    }
}

pub fn game_instance_manager_spawn(comms: GameComms) -> JoinHandle<()> {
    println!("is it my logs?");
    error!("[GIM]: Am i spawned?");
    return tokio::spawn(game_instance_manager(comms));
}
