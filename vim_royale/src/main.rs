use anyhow::Result;
use log::warn;
use tokio::net::TcpListener;
use clap::Parser;
use vim_royale::connections::connection::{handle_incoming_messages, SerializationType};
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
    println!("args {:?}", args);
    let server = TcpListener::bind(format!("0.0.0.0:{}", args.port)).await?;

    warn!("starting the server on {}", args.port);
    let mut player_id = 0;
    let (tx, mut rx) = tokio::sync::mpsc::channel(100);

    tokio::spawn(async move {
        println!("await a message");
        while let Some(msg) = rx.recv().await {
            println!("got message {:?}", msg);
        }
    });

    loop {
        match server.accept().await {
            Ok((stream, _)) => {
                player_id += 1;
                let stream = tokio_tungstenite::accept_async(stream).await?;
                let (write, read) = stream.split();
                tokio::spawn(handle_incoming_messages(player_id, read, write, tx.clone(), args.serialization.clone())).await.ok();
            },

            Err(e) => {
                println!("error {}", e);
                break;
            }
        }
    }

    return Ok(());
}
