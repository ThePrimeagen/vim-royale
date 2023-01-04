use anyhow::Result;
use clap::Parser;
use futures_util::StreamExt;
use game::{connection::SerializationType, game_manager::game_instance_manager_spawn};
use log::{error, warn, info};
use tokio::net::TcpListener;

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

    let mut game_manager = game::game_manager::GameManager::new(args.serialization.clone());
    game_instance_manager_spawn(rx, tx.clone());

    let mut connection_count = 0;
    loop {
        match server.accept().await {
            Ok((stream, _)) => {
                let stream = tokio_tungstenite::accept_async(stream).await?;
                let (write, read) = stream.split();
                connection_count += 1;
                info!("[SERVER]: sending game manage new connection {}", connection_count);
                tx.send(G...)
            }

            Err(e) => {
                error!("error {}", e);
                break;
            }
        }
    }

    return Ok(());
}
