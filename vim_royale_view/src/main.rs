use wasm_bindgen_futures::spawn_local;
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

fn main() {
    let ws = WebSocket::open("ws://vim-royale.theprimeagen.tv:42001").unwrap();
    let (mut write, mut read) = ws.split();

    spawn_local(async move {
        while let Some(Ok(msg)) = read.next().await {
            println!("hello {:?}", msg);
        }
    });

    spawn_local(async move {
        loop {
            gloo::timers::future::TimeoutFuture::new(2000).await;
            write.send(Message::Text("hello".into())).await.unwrap();
        }
    });

    yew::start_app::<App>();
}
