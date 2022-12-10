use anyhow::Result;
use clap::Parser;
use futures_util::StreamExt;
use game::connection::SerializationType;
use log::{error, warn};
use tokio::net::TcpListener;

#[derive(Parser, Debug)]
#[clap()]
struct Args {
    #[clap(short = 'p', long = "port", default_value_t = 42001)]
    port: u16,

    #[clap(short = 's', long = "serialization", value_enum, default_value_t = SerializationType::Deku)]
    serialization: SerializationType,
}

fn foo(x: usize, y: usize) {
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

    loop {
        match server.accept().await {
            Ok((stream, _)) => {
                let stream = tokio_tungstenite::accept_async(stream).await?;
                let (write, read) = stream.split();
                game_manager.add_connection(read, write).await;
            }

            Err(e) => {
                println!("error {}", e);
                break;
            }
        }
    }

    return Ok(());
}
