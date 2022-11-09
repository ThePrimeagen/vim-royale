use anyhow::Result;
use log::warn;
use tokio::net::TcpListener;
use clap::Parser;
use vim_royale::connections::connection::{SerializationType, TcpConnection, Connection, ConnectionMessage};

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
    let args = Args::parse();
    let server = TcpListener::bind(format!("0.0.0.0:{}", args.port)).await?;

    warn!("starting the server on {}", args.port);
    let mut player_id = 0;

    while let Ok((stream, _)) = server.accept().await {
        let mut conn = TcpConnection::new(player_id, stream, args.serialization.clone());
        player_id += 1;

        let mut receive_rx = conn.player_to_game().expect("to exist");

        tokio::spawn(async move {
            while let Some(msg) = receive_rx.recv().await {
                match msg {
                    ConnectionMessage::Msg(msg, player_id) => {
                        println!("msg: {:?} player_id: {}", msg, player_id);
                    }

                    ConnectionMessage::Error(e) => {
                        println!("the connection has error {}", e);
                        break;
                    }
                    ConnectionMessage::Close(_) => {
                        println!("the connection has closed");
                        break;
                    }
                }
            }
        });
    }

    return Ok(());
}

