use std::collections::HashMap;

use crate::board::Map;
use anyhow::Result;
use encoding::server::{self, ServerMessage, WHO_AM_I_CLIENT, WHO_AM_I_SERVER};
use futures::{Sink, SinkExt, Stream, StreamExt};
use log::error;
use tokio::sync::mpsc::{Receiver, Sender};
use tokio_tungstenite::tungstenite;

const ENTITY_RANGE: u16 = 500;

pub struct Player {
    entity_start: u16,
    position: (u16, u16),
}

enum GameMessage {
    Close(usize),
}

pub struct Game {
    map: Map,
    players: Vec<Option<Player>>,
    player_id: u32,
    game_id: u32,
}

type GameStreamItem = Result<tungstenite::Message, tungstenite::Error>;
impl Game {
    pub fn new(seed: u32, game_id: u32) -> Game {
        return Game {
            map: Map::new(seed),
            player_id: 0,
            players: Vec::with_capacity(100),
            game_id,
        };
    }

    async fn process_message(&mut self, msg: ServerMessage) {
        match msg.msg {
            server::Message::Whoami(whoami) => if whoami == WHO_AM_I_CLIENT {},
            _ => {}
        }
    }

    pub async fn run(&mut self) -> Result<()> {
        /*
        loop {
            match self.rx.recv() {
                Ok(msg) => {
                    println!("Received message: {:?}", msg);
                }
                Err(_) => {
                    error!("Error receiving message");
                }
            }
        }
        */
        return Ok(());
    }

    pub fn is_full(&self) -> bool {
        return self.player_id == 100;
    }

    pub fn add_player(
        &mut self,
        stream: impl Stream<Item = GameStreamItem> + Unpin + Send,
        sink: impl Sink<tungstenite::Message>,
    ) {
        let player_id = self.player_id;
        self.player_id += 1;

        let player = Player {
            entity_start: (self.player_id as u16) * ENTITY_RANGE,
            position: (256, 256),
        };

        self.players[player_id as usize] = Some(player);
    }
}

pub struct GameManager {
    game_id: u32,
    games: HashMap<u32, Game>,
    rx: Receiver<GameMessage>,
    tx: Sender<GameMessage>,
}

impl GameManager {
    pub fn new() -> GameManager {
        let (tx, rx) = tokio::sync::mpsc::channel(10);

        return GameManager {
            games: HashMap::new(),
            game_id: 0,
            rx,
            tx,
        };
    }

    pub fn add_connection(
        &mut self,
        stream: impl Stream<Item = GameStreamItem> + Unpin + Send,
        sink: impl Sink<tungstenite::Message>,
    ) {
        let game = self.games.entry(self.game_id).or_insert_with(|| {
            return Game::new(self.game_id, self.game_id);
        });

        // TODO: This logic will have to change once i have some sort of game lobby
        // and time limit.
        game.add_player(stream, sink);
        if game.is_full() {
            self.game_id += 1;
            self.games.insert(self.game_id, Game::new(self.game_id, self.game_id));
        }
    }
}
