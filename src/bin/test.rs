use anyhow::Result;
use tokio::io::AsyncReadExt;
use tokio::time::Instant;
use tokio::{net::TcpListener};//, io::AsyncReadExt};
use tokio_stream::wrappers::TcpListenerStream;
use tokio_stream::StreamExt;
use async_stream::stream;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let server = TcpListener::bind("0.0.0.0:12345").await?;

    while let Ok((stream, addr)) = server.accept().await {
        let (mut read, write) = stream.into_split();
    }

    return Ok(());
}
