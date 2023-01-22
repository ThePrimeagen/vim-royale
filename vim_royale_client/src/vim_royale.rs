use std::{cell::RefCell, rc::Rc, borrow::BorrowMut};

use anyhow::Result;
use encoding::{
    self,
    server::{self, ServerMessage},
};
use futures::{channel::mpsc::{Sender, channel}, SinkExt, StreamExt, stream::SplitStream};
use game_core::player::Player;
use reqwasm::websocket::{futures::WebSocket, Message};
use wasm_bindgen_futures::spawn_local;

use vim_royale_view::{
    container::{VimRoyale, VimRoyaleProps},
    message::Msg,
    state::RenderState,
};

use leptos::*;
use web_sys::Event;

use crate::state::{state::StateReactor, reactors::{status::Status, debug::DebugMessages, player_position::PlayerPosition}};

#[component]
fn App(cx: Scope) -> Element {
    return view! {cx,
        <VimRoyale />
    };
}

async fn read_ws(_cx: Scope, mut reactor: Sender<Msg>, mut ws: SplitStream<WebSocket>, mut tx: Sender<ServerMessage>) -> Result<()> {
    loop {
        match ws.next().await {
            Some(Ok(Message::Bytes(msg))) => {
                let msg = ServerMessage::deserialize(&msg).unwrap();
                match msg.msg {
                    server::Message::ClockSyncRequest(_) => {
                        let now = js_sys::Date::now() as i64 + 69420;
                        let msg = server::Message::clock_response(now);
                        _ = tx.send(ServerMessage::new(0, msg)).await;
                    }
                    _ => {
                        _ = reactor.send(Msg::Message(msg)).await;
                    }
                }
            }

            Some(Ok(Message::Text(msg))) => {
                leptos::log!("got text message??? {:?}", msg);
            }

            Some(Err(e)) => {
                leptos::log!("error on websocket: {:?}", e);
                break;
            }

            None => {
                leptos::log!("assuming connection is closed due to none.");
                break;
            }
        }
    }

    return Ok(());
}

// a function that returns a function
fn on_keypress(ws_tx: Sender<ServerMessage>, reactor_tx: Sender<Msg>) -> impl Fn(Event) {
    return move |k: Event| {
        let mut ws_tx = ws_tx.clone();
        let mut reactor_tx = reactor_tx.clone();
        let k = k.dyn_into::<web_sys::KeyboardEvent>().unwrap();
        leptos::log!("here is my key: {:?}", k);

        k.prevent_default();
        k.stop_propagation();


        spawn_local(async move {
            _ = reactor_tx.send(Msg::KeyStroke(k.key())).await;
            let msg =
                ServerMessage::new(0, server::Message::key_press(k.key_code() as u8, 0));
            let _ = ws_tx.send(msg).await;
        });

        return;
    };

}

pub fn vim_royale() -> Result<()> {
    gloo::console::log!("setting up the signal for ws socket connection");
    let msg = ServerMessage::CLIENT_WHO_AM_I;
    let msg = msg.serialize()?;

    mount_to_body(move |cx| {
        let (state_read, state_write) = create_signal::<Msg>(cx, Msg::Connecting);
        let render_state: &'static RenderState =
            Box::leak(Box::new(RenderState::new(state_read, cx)));
        let ws = WebSocket::open("ws://vim-royale.theprimeagen.tv:42001").unwrap();
        let (mut sink, stream) = ws.split();
        let (ws_tx, mut ws_rx) = channel::<ServerMessage>(1);

        let mut reactor: StateReactor<RenderState, Msg, ServerMessage> = StateReactor::new(cx, ws_tx.clone());
        reactor.register_callback(Box::new(Status {}));
        reactor.register_callback(Box::new(DebugMessages {}));
        reactor.register_callback(Box::new(PlayerPosition {}));

        provide_context::<&'static RenderState>(cx, render_state);

        let msg = msg.clone();

        spawn_local(async move {
            leptos::log!("setting connecting");
            let _ = reactor.tx.send(Msg::Connecting).await;

            match sink.send(Message::Bytes(msg)).await {
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

            spawn_local(async move {
                while let Some(msg) = ws_rx.next().await {
                    let msg = match msg.serialize() {
                        Ok(msg) => msg,
                        _ => continue,
                    };
                    let msg = Message::Bytes(msg);
                    let _ = sink.send(msg).await;
                }
            });

            window_event_listener("keydown", on_keypress(ws_tx.clone(), reactor.tx.clone()));

            match read_ws(cx, reactor.tx.clone(), stream, ws_tx).await {
                Ok(_) => {
                    leptos::log!("read ws is done");
                }
                Err(e) => {
                    leptos::log!("error on read ws: {:?}", e);
                }
            }

            // TODO: Client side error handling

            gloo::console::log!("socket closed");
            state_write.set(Msg::Closed);
        });

        return view! {cx, <App />};
    });

    return Ok(());
}
