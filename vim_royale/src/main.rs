use anyhow::Result;
use game::connection::handle_incoming_messages;
use log::warn;
use tokio::net::TcpListener;
use clap::Parser;
use futures_util::StreamExt;

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

    let args = Args::parse();
    let args2 = Args::parse();

    println!("args {:?}", args);
    let server = TcpListener::bind(format!("0.0.0.0:{}", args.port)).await?;

    warn!("starting the server on {}", args.port);
    let mut player_id = 0;
    let (tx, mut rx) = tokio::sync::mpsc::channel(100);

    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            println!("got message {:?}", msg);
        }
    });

    let game_manager = game::game::GameManager::new();

    loop {
        match server.accept().await {
            Ok((stream, _)) => {
                player_id += 1;
                let stream = tokio_tungstenite::accept_async(stream).await?;
                let (write, read) = stream.split();
                game_manager.add_connection(read, write);

                tokio::spawn(handle_incoming_messages(player_id, read, tx.clone(), args.serialization.clone())).await.ok();
            },

            Err(e) => {
                println!("error {}", e);
                break;
            }
        }
    }

    return Ok(());
}
