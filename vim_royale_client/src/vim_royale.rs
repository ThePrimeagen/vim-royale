use anyhow::Result;
use encoding::{
    self,
    server::{self, ServerMessage},
};
use futures::{SinkExt, StreamExt};
use reqwasm::websocket::{futures::WebSocket, Message};
use wasm_bindgen_futures::spawn_local;

use vim_royale_view::{
    container::{VimRoyale, VimRoyaleProps},
    message::Msg,
    state::{AppState, RenderState},
};

use leptos::*;
use web_sys::Event;

#[component]
fn App(cx: Scope) -> Element {
    return view! {cx,
        <VimRoyale />
    };
}

async fn read_ws(cx: Scope, mut app_state: AppState, mut ws: WebSocket) -> Result<()> {
    loop {
        match ws.next().await {
            Some(Ok(Message::Bytes(msg))) => {
                let msg = ServerMessage::deserialize(&msg).unwrap();
                match msg.msg {
                    server::Message::ClockSyncRequest(_) => {
                        let now = js_sys::Date::now() as i64 + 69420;
                        let msg = server::Message::clock_response(now);
                        let msg = ServerMessage::new(0, msg).serialize();
                        match msg {
                            Ok(msg) => {
                                _ = ws.send(Message::Bytes(msg)).await;
                            }
                            Err(e) => {
                                leptos::log!("error on clock sync: {:?}", e);
                            }
                        }
                    }
                    _ => app_state.update_state(cx, Msg::Message(msg)),
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

pub fn vim_royale() -> Result<()> {
    gloo::console::log!("setting up the signal for ws socket connection");
    let msg = ServerMessage::CLIENT_WHO_AM_I;
    let msg = msg.serialize()?;

    mount_to_body(move |cx| {
        let (state_read, state_write) = create_signal::<Msg>(cx, Msg::Connecting);
        let render_state: &'static RenderState =
            Box::leak(Box::new(RenderState::new(state_read, cx)));
        let mut app_state = AppState::new();

        provide_context::<&'static RenderState>(cx, render_state);

        let msg = msg.clone();
        // let mut ticker = Tick::new().unwrap();

        spawn_local(async move {
            leptos::log!("setting connecting");
            app_state.update_state(cx, Msg::Connecting);

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

            let keydown = move |k: Event| {
                leptos::log!("here is my key: {:?}", k);

                k.prevent_default();
                k.stop_propagation();

                return;
            };

            window_event_listener("keydown", keydown);
            match read_ws(cx, app_state, ws).await {
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
