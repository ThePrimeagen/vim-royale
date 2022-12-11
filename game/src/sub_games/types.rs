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
trait SubGame<T> {
    fn msg(&mut self, player_id: u8, msg: ServerMessage) -> Result<Option<T>>;
    fn update(&mut self, delta_us: u64) -> Result<Option<T>>;
    fn starting_screen(&self) -> Result<StartingScreen>;
    async fn close(&mut self) -> Result<()>;
}
