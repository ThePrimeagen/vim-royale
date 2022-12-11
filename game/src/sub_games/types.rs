use anyhow::Result;
use async_trait::async_trait;
use encoding::server::ServerMessage;

pub enum SubGameMessage<T> {
    GameStart,
    GameEnd,
    GameInfo(&'static str, &'static str),
    GameUpdate(T),
}

type StartingScreen = [[u8; 80]; 24];

#[async_trait]
pub trait SubGame<T> {
    fn msg(&mut self, player_id: usize, msg: ServerMessage) -> Result<Option<SubGameMessage<T>>>;
    fn update(&mut self, tick: usize, delta_us: u64) -> Result<Option<SubGameMessage<T>>>;
    fn starting_screen(&self) -> Result<StartingScreen>;
    async fn close(&mut self) -> Result<()>;
}
