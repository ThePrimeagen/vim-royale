use anyhow::Result;
use encoding::server::ServerMessage;
use futures::{SinkExt, StreamExt};
use wasm_bindgen_futures::spawn_local;

use reqwasm::websocket::futures::WebSocket;
use reqwasm::websocket::Message;

use vim_royale_view::{
    container::{VimRoyale, VimRoyaleProps},
    message::Msg,
    state::AppState, string_scroller::{scroll_strings, the_primeagen},
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

        spawn_local(async move {
            gloo::timers::future::TimeoutFuture::new(1000).await;

            let mut scroller = scroll_strings(the_primeagen(), 0);
            let mut scroller2 = scroll_strings(the_primeagen(), 12);

            let state = use_context::<&'static AppState>(cx)
                .expect("should always exist");

            let mut count = 0;
            let mut now = js_sys::Date::now();
            let mut run2 = false;

            gloo::timers::callback::Interval::new(0, move || {
                count += 1;

                if !scroller(state) {
                    let next_now = js_sys::Date::now();
                    leptos::log!("count: {} {}", count, next_now - now);

                    now = next_now;
                    count = 0;
                }

                if run2 {
                    scroller2(state);
                }

                if !run2 && count > 50 {
                    run2 = true;
                }
            }).forget();
        });

        return view! {cx, <App />};
    });

    return Ok(());
}

// WEBSOCKET STUFF
// TODO: This needs to be pushed into a place where i can re-initialize
// everything and run this again.
/*
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
*/
