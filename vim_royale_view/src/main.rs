use anyhow::{Result, Context};
use wasm_bindgen_futures::spawn_local;
use encoding::server::ServerMessage;
use yew::prelude::*;
use futures::{StreamExt, SinkExt};

use reqwasm::websocket::futures::WebSocket;
use reqwasm::websocket::Message;

#[function_component(App)]
fn app() -> Html {
    html! {
        <h1>{ "Hello World" }</h1>
    }
}

#[derive(Properties, PartialEq)] 
struct Props { 
    error: String
} 

#[function_component(Err)] 
fn err(props: &Props) -> Html {
    html! {
        <h1>{ format!("hel me daddy {:?}", props.error) }</h1>
    }
}

async fn run_main_application(ws: WebSocket) {
    let (mut write, mut read) = ws.split();
    
    spawn_local(async move {
        while let Some(Ok(msg)) = read.next().await {
            println!("hello {:?}", msg);
        }
    });

    spawn_local(async move {
    });

    yew::start_app::<App>();
}

fn main() -> Result<()> {
    let msg = ServerMessage::CLIENT_WHO_AM_I;
    let msg = msg.serialize()?;

    spawn_local(async move {
        let mut ws = WebSocket::open("ws://vim-royale.theprimeagen.tv:42001").unwrap();
        gloo::console::log!("about to send message");
        match ws.send(Message::Bytes(msg)).await {
            Err(e) => {
                gloo::console::log!("message was a failure");
                yew::start_app_with_props::<Err>(Props { error: format!("encountered error: {}", e) });
            }
            
            Ok(_) => {
                gloo::console::log!("lets go, it worked, rendering application");
                let _ = run_main_application(ws).await;
            },
        }
    });

    return Ok(());
}
