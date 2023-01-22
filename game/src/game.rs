use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};

//use game_core;

use anyhow::Result;
use encoding::server::{self, ServerMessage};
use futures::SinkExt;
use game_core::player::{Player, PLAYER_START_POS};
use log::{error, info, warn};

use crate::{
    connection::ConnectionMessage,
    game_comms::{GameComms, GameInstanceMessage, GameReceiver, GameSender},
    player::{next_player_msg, PlayerWebSink, PlayerWebStream},
};

pub const PLAYER_COUNT: usize = 1;
pub const FPS: u128 = 16_666;
pub const WAITING_FOR_CONNECTIONS: usize = 0;
pub const PLAYING: usize = 1;
pub const FINISHED: usize = 2;

#[derive(Clone, Debug)]
pub struct GameStub {
    pub player_count: Arc<AtomicUsize>,
    pub game_state: Arc<AtomicUsize>,
    pub game_id: usize,
}

async fn handle_player_connection(
    id: u8,
    mut stream: PlayerWebStream,
    tx_to_game: GameSender,
) -> Result<()> {
    loop {
        let msg =
            next_player_msg(id, &mut stream, crate::connection::SerializationType::Deku).await;

        match msg {
            Ok(msg) => _ = tx_to_game.send(GameInstanceMessage::Msg(msg)).await,
            Err(_) => {
                _ = tx_to_game
                    .send(GameInstanceMessage::PlayerConnectionFailed(id))
                    .await;
                break;
            }
        }
    }

    return Ok(());
}

fn get_messages(rx: &mut GameReceiver) -> Vec<ConnectionMessage> {
    let mut msgs = vec![];
    while let Ok(msg) = rx.try_recv() {
        if let GameInstanceMessage::Msg(msg) = msg {
            msgs.push(msg);
        }
    }

    return msgs;
}

fn process_messages(msg: ConnectionMessage, stub: &mut GameStub) {}

async fn start_game(
    stub: &GameStub,
    players_to_sink: &mut HashMap<u8, (PlayerWebSink, Player)>,
) -> Result<()> {
    error!("starting game {}", stub.game_id);

    stub.game_state.store(PLAYING, Ordering::Relaxed);

    let player_start = server::PlayerStart { position: PLAYER_START_POS };

    let start_game = ServerMessage::new(0, server::Message::PlayerStart(player_start));
    let msg = start_game
        .serialize()
        .expect("this to always work. if it doesn't we are screwed");
    let msg = tokio_tungstenite::tungstenite::Message::Binary(msg);

    // TODO: Is starting positions importart?
    for (id, (sink, _)) in players_to_sink.iter_mut() {
        error!("starting game for {}", id);
        match sink.send(msg.clone()).await {
            Ok(_) => {
                info!("sent start to {}", id);
            }
            Err(e) => {
                error!("sent start to {} and it errored with {:?}", id, e);
                unreachable!("HANDLE ME DADDY");
            }
        }
    }

    return Ok(());
}

pub async fn game(mut comms: GameComms, mut stub: GameStub) -> Result<()> {
    let mut player_id: u8 = 0;
    let (tx, mut rx) = tokio::sync::mpsc::channel(100);
    let start = std::time::Instant::now();
    let mut tick = 0;
    let mut last_tick = start;
    let mut players_to_sink = HashMap::new();

    loop {
        let current = start.elapsed().as_micros();
        let next_frame = tick * FPS;
        let duration = if next_frame == 0 {
            0
        } else {
            next_frame - current
        } as u64;
        let duration = std::time::Duration::from_micros(duration);

        tokio::select! {

            msg = comms.receiver.recv() => {
                info!("game({}) comms receive: {:?}", stub.game_id, msg);

                if let Some(GameInstanceMessage::Connection(stream, sink)) = msg {
                    info!("game({}) connection received", stub.game_id);

                    // TODO: Sync the clock to the player

                    let player = Player::new(player_id, 0);

                    players_to_sink.insert(player_id, (sink, player));

                    tokio::spawn(handle_player_connection(player_id, stream, tx.clone()));

                    player_id += 1;

                    let players = stub.player_count.fetch_add(1, Ordering::Relaxed);
                    error!("current player count {}, expected to start {}", players + 1, PLAYER_COUNT);
                    if players + 1 >= PLAYER_COUNT {
                        error!("STARTING GAME???");
                        // I want this to be a function
                        // but for some odd reason passing &mut ... makes me feel bad
                        match start_game(&stub, &mut players_to_sink).await {
                            Ok(_) => {},
                            Err(e) => {
                                error!("start_game call failed {:?}", e);
                            }
                        }
                    }

                }
            }

            _ = tokio::time::sleep(duration) => {

                tick += 1;
                if tick % 10000 == 0 {
                    info!("game({}) tick {}", stub.game_id, tick);
                }

                // 1. get every message sent to the sink
                // 2. process and update game state
                // 3. respond to any players with msgs
                // 4. sleep some amount of time

                // 1.
                let msgs = get_messages(&mut rx);
                for msg in msgs {

                    // could clone out stub, but i don't think that is great
                    // i could also implement copy to make things feel nicer.
                    process_messages(msg, &mut stub);
                }

                // check leave conditions.
                let player_count = stub.player_count.load(Ordering::Relaxed);
                let state = stub.game_state.load(Ordering::Relaxed);
                if  player_count == 0 && state > WAITING_FOR_CONNECTIONS {
                    break;
                }
            }
        }
    }

    info!("comms({}) has finished", stub.game_id);

    return Ok(());
}

pub fn spawn_new_game(game_id: usize, comms: GameComms) -> GameStub {
    error!("[GAME] new game spawned");
    let stub = GameStub {
        player_count: Arc::new(AtomicUsize::new(0)),
        game_state: Arc::new(AtomicUsize::new(WAITING_FOR_CONNECTIONS)),
        game_id,
    };

    let inner_stub = stub.clone();
    tokio::spawn(async move {
        error!("[GAME]: Creating new game thread");
        if let Err(e) = game(comms, inner_stub).await {
            error!("[GAME] game failed while running {:?}", e);
        } else {
            warn!("[GAME] game {} successfully ended", game_id);
        }
    });

    return stub;
}

/*
use std::sync::{
    atomic::{AtomicU8, Ordering},
    Arc,
};

use crate::{
    connection::{ConnectionMessage, SerializationType},
    game_comms::{GameComms, GameInstanceMessage},
    player::{spawn_player_stream, Player, PlayerSink, PlayerWebSink, PlayerWebStream},
};
use anyhow::{Result, anyhow};
use encoding::server::{self, ServerMessage, WHO_AM_I_CLIENT, WHO_AM_I_UNKNOWN};

use futures::StreamExt;
use log::{error, info, warn};
use map::map::Map;
use tokio::sync::mpsc::{Receiver, Sender};
use tokio_tungstenite::tungstenite::Message;

const PLAYER_COUNT: usize = 100;

struct Game<const P: usize> {
    seed: u32,
    _map: Map,
    players: [Option<Player>; P],
    player_count: Arc<AtomicU8>,
    ser_type: SerializationType,
    game_id: u32,
    rx: Receiver<ConnectionMessage>,
    tx: Sender<ConnectionMessage>,
}

fn create_player_start_msg(player: &Player, seed: u32) -> server::Message {
    return server::Message::PlayerStart(server::PlayerStart {
        entity_id: player.id as usize * ENTITY_RANGE as usize,
        position: player.position,
        range: ENTITY_RANGE,
        seed,
    });
}

impl<const P: usize> Game<P> {
    pub fn new(
        seed: u32,
        game_id: u32,
        player_count: Arc<AtomicU8>,
        ser_type: SerializationType,
    ) -> Self {
        let players = std::array::from_fn(|_| None);
        let (tx, rx) = tokio::sync::mpsc::channel(100);

        return Game {
            _map: Map::new(seed),
            player_count,
            players,
            game_id,
            seed,
            ser_type,
            rx,
            tx,
        };
    }

    fn process_message(&mut self, msg: ConnectionMessage) {
        match msg {
            ConnectionMessage::Msg(msg) => info!("[GAME]: ServerMessage {:?}", msg),

            ConnectionMessage::Close(id) => {
                info!("[GAME]: ConnectionClosed {:?}", id);
                self.players[id as usize] = None;
                self.player_count.fetch_sub(1, Ordering::Relaxed);
            },

            x => info!("[GAME]: ConnectionMessage {:?}", x),
        }
    }

    fn get_messages(&mut self) -> Vec<ConnectionMessage> {
        let mut msgs = vec![];
        while let Ok(msg) = self.rx.try_recv() {
            msgs.push(msg);
        }

        return msgs;
    }

    async fn run(&mut self) -> Result<()> {
        error!("[GAME]: game run game_id={}, seed={}", self.game_id, self.seed);
        let start = std::time::Instant::now();
        let mut tick = 0;

        loop {
            tick += 1;

            // 1. get every message sent to the sink
            // 2. process and update game state
            // 3. respond to any players with msgs
            // 4. sleep some amount of time

            // 1.
            let msgs = self.get_messages();
            if !msgs.is_empty() {
                for msg in msgs {
                    self.process_message(msg);
                }
            }

            let current = start.elapsed().as_micros();
            let next_frame = tick * FPS;

            if current < next_frame {
                let duration = (next_frame - current) as u64;
                let duration = std::time::Duration::from_micros(duration);
                tokio::time::sleep(duration).await;
            }

            // check leave conditions.
            if self.player_count.load(Ordering::Relaxed) == 0 {
                break;
            }
        }

        self.error("Game Completed");
        return Ok(());
    }

    fn is_ready(&self) -> bool {
        let id = self.player_count.load(Ordering::Relaxed);
        info!("[GAME] Ready check {} == {}", id, 1);
        return id == 1;
    }

    async fn add_player(
        &mut self,
        mut stream: PlayerWebStream,
        mut sink: PlayerWebSink,
    ) -> Result<()> {
        let player_id = self.player_count.fetch_add(1, Ordering::Relaxed);

        let clock_diff = Player::sync_clock(10, &mut stream, &mut sink).await.unwrap_or(0);
        self.error(&format!("creating player({}): synced clock with offset {}", player_id, clock_diff));

        let player = Player {
            position: (256, 256),
            id: player_id,
            sink: PlayerSink::new(player_id, sink),
            clock_diff,
        };

        spawn_player_stream(player_id, stream, self.ser_type, self.tx.clone());

        self.players[player_id as usize] = Some(player);

        return Ok(());
    }

    // TODO: this probably has to be more robust to not cause a panic
    async fn start_game(&mut self) -> Result<()> {
        let mut handles = vec![];

        self.warn("starting game");
        for player in self.players.iter_mut() {
            if let Some(player) = player {
                let msg = create_player_start_msg(player, self.seed);
                handles.push(player.sink.send(msg));
            }
        }

        let _ = futures::future::join_all(handles).await;

        // TODO: Close any connections that errored and get rid of them.

        return Ok(());
    }

    fn error(&self, msg: &str) {
        error!(
            "[GAME]: msg={} id={} player_count={} seed={}",
            msg,
            self.game_id,
            self.player_count.load(Ordering::Relaxed),
            self.seed
        );
    }

    fn warn(&self, msg: &str) {
        warn!(
            "[GAME]: msg={} id={} player_count={} seed={}",
            msg,
            self.game_id,
            self.player_count.load(Ordering::Relaxed),
            self.seed
        );
    }

    fn info_string(&self) -> String {
        return format!(
            "id={} player_count={} seed={}",
            self.game_id,
            self.player_count.load(Ordering::Relaxed),
            self.seed
        );
    }
}

fn whoami<T>(msg: Option<Result<Message, T>>) -> Result<u8> {
    match msg {
        Some(Ok(Message::Binary(msg))) => {
            let msg = ServerMessage::deserialize(&msg)?;
            match msg.msg {
                server::Message::Whoami(whoami) => {
                    return Ok(whoami);
                }
                _ => {
                    return Err(anyhow!("expected whoami message"));
                }
            }
        }
        _ => return Ok(WHO_AM_I_UNKNOWN),
    }
}

pub async fn game_run(
    seed: u32,
    player_count: Arc<AtomicU8>,
    game_id: u32,
    mut comms: GameComms,
    ser_type: SerializationType,
) {
    let mut game = Game::<PLAYER_COUNT>::new(seed, game_id, player_count, ser_type);
    error!("[GAME-RUNNER]: New game started game_id={}, seed={}", game_id, seed);

    loop {
        match comms.receiver.recv().await {
            Some(GameInstanceMessage::Connection(mut stream, sink)) => {
                info!(
                    "[GAME-RUNNER] new player connection for game {}",
                    game.info_string()
                );

                let msg = whoami(stream.next().await);

                if let Ok(WHO_AM_I_CLIENT) = msg {
                    _ = game.add_player(stream, sink).await;
                    if game.is_ready() {
                        break;
                    }
                } else {
                    _ = sink.reunite(stream).map(|mut x| {
                        _ = x.close(None)
                    });
                    continue;
                }
            }

            Some(msg) => {
                game.error(&format!(
                    "Game comms channel gave a non connection message {:?}.",
                    msg
                ));
                unreachable!("this should never happen");
            }

            None => {
                game.error("Game comms channel closed");
                unreachable!("this should never happen");
            }
        }
    }

    /*
    match comms.sender.send(GameMessage::Start).await {
        Ok(_) => {
            game.warn("Game sent start");
        }
        Err(_) => {
            game.error("Game failed to send start");
            unreachable!("this should never happen in production.");
        }
    }
    */

    match game.start_game().await {
        Ok(_) => {
            game.warn("started");
        }
        Err(e) => {
            game.error(&format!("faled to start: {:?}", e));
        }
    }

    match game.run().await {
        Ok(_) => {
            game.warn("finished successfully");
        }
        Err(e) => {
            game.warn(&format!("finished with error {}", e));
        }
    }

    /*
    _ = comms.sender.send(GameMessage::Close(game.game_id as usize)).await;
    */
}
*/
