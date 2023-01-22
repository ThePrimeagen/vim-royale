use anyhow::Result;
use clap::Parser;
use futures_util::StreamExt;
use game::{connection::SerializationType, game_manager::game_instance_manager_spawn, game_comms::{GameInstanceMessage, GameComms}};
use log::{error, warn, info};
use tokio::{net::TcpListener, sync::mpsc::channel};

#[derive(Parser, Debug)]
#[clap()]
struct Args {
    #[clap(short = 'p', long = "port", default_value_t = 42001)]
    port: u16,

    #[clap(short = 's', long = "serialization", value_enum, default_value_t = SerializationType::Deku)]
    serialization: SerializationType,
}

// #[tokio::main(flavor = "current_thread")]
#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    let args: &'static Args = Box::leak(Box::new(Args::parse()));

    error!("args {:?}", args);
    let server = TcpListener::bind(format!("0.0.0.0:{}", args.port)).await?;


    warn!("starting the server on {}", args.port);
    let (tx, _) = channel(100);
    let (comms, tx) = GameComms::with_sender(tx);

    let handle = game_instance_manager_spawn(comms);

    let mut connection_count = 0;
    info!("[SERVER]: Help me daddy?");
    loop {
        match server.accept().await {
            Ok((stream, _)) => {
                let stream = tokio_tungstenite::accept_async(stream).await?;
                let (write, read) = stream.split();
                connection_count += 1;
                info!("[SERVER]: sending game manage new connection {}", connection_count);

                _ = tx.send(GameInstanceMessage::Connection(read, write)).await;
            }

            Err(e) => {
                error!("error {}", e);
                break;
            }
        }
    }

    return Ok(());
}
