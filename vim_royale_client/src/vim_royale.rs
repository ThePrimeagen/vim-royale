use anyhow::Result;
use encoding::server::ServerMessage;
use futures::{SinkExt, StreamExt, channel::mpsc::{Sender, Receiver}};
use reqwasm::websocket::{futures::WebSocket, Message};
use wasm_bindgen_futures::spawn_local;

use vim_royale_view::{
    container::{VimRoyale, VimRoyaleProps},
    message::Msg,
    state::AppState, utils::string_scroller::{scroll_strings, the_primeagen},
};

use leptos::*;

#[component]
fn App(cx: Scope) -> Element {
    return view! {cx,
        <VimRoyale />
    };
}

pub fn vim_royale() -> Result<()> {
    gloo::console::log!("setting up the signal for ws socket connection");
    let msg = ServerMessage::CLIENT_WHO_AM_I;
    let msg = msg.serialize()?;

    mount_to_body(move |cx| {
        let (state_read, state_write) = create_signal::<Msg>(cx, Msg::Connecting);
        let app_state: &'static AppState = Box::leak(Box::new(AppState::new(state_read, cx)));
        provide_context(cx, app_state);

        let msg = msg.clone();
        // let mut ticker = Tick::new().unwrap();

        spawn_local(async move {

            let mut ws = WebSocket::open("ws://vim-royale.theprimeagen.tv:42001").unwrap();
            match ws.send(Message::Bytes(msg)).await {
                Err(e) => {
                    gloo::console::log!("error on connection");
                    let e = format!("ERROR ON STARTUP: {:?}", e);
                    state_write.set(Msg::Error(e));
                }

                Ok(_) => {
                    gloo::console::log!("lets go, it worked, rendering application");
                    state_write.set(Msg::Connected);
                }
            }

            // TODO: Client side error handling
            while let Some(Ok(Message::Bytes(msg))) = ws.next().await {

                let msg = ServerMessage::deserialize(&msg).unwrap();
                gloo::console::log!(format!("received {:?}", msg));
                state_write.set(Msg::Message(msg));
            }

            gloo::console::log!("socket closed");
            state_write.set(Msg::Closed);
        });

        return view! {cx, <App />};
    });

    return Ok(());
}

