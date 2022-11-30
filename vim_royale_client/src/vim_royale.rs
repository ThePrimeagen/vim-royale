use anyhow::Result;
use encoding::server::ServerMessage;
use futures::{SinkExt, StreamExt};
use reqwasm::websocket::{futures::WebSocket, Message};
use wasm_bindgen_futures::spawn_local;

use vim_royale_view::{
    container::{VimRoyale, VimRoyaleProps},
    message::Msg,
    state::{AppState, RenderState},
};

use leptos::*;
use web_sys::{Event, KeyboardEvent};

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

            // TODO: Client side error handling
            while let Some(Ok(Message::Bytes(msg))) = ws.next().await {
                // TODO: Dangerous
                let msg = ServerMessage::deserialize(&msg).unwrap();
                app_state.update_state(cx, Msg::Message(msg));
            }

            gloo::console::log!("socket closed");
            state_write.set(Msg::Closed);
        });

        return view! {cx, <App />};
    });

    return Ok(());
}
