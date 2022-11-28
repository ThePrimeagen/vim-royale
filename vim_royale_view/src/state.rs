use anyhow::Result;
use futures::{StreamExt, channel::mpsc::{Sender, Receiver}};

use arr_macro::arr;
use leptos::*;
use crate::message::Msg;

pub struct Tick {
    rx: Receiver<()>,
    channel: web_sys::MessageChannel,
}

impl Tick {
    pub fn new() -> Result<Tick> {
        let (tx, rx) = futures::channel::mpsc::channel(1);
        let channel = web_sys::MessageChannel::new().unwrap();
        let closure = Tick::closure(tx.clone());
        channel.port1().set_onmessage(Some(
            closure.into_js_value().unchecked_ref(),
        ));

        return Ok(Tick {
            rx,
            channel,
        });
    }

    fn closure(mut tx: Sender<()>) -> wasm_bindgen::closure::Closure<dyn FnMut(web_sys::MessageEvent)> {
        return wasm_bindgen::closure::Closure::wrap(Box::new(move |_| {
            let _ = tx.try_send(());
        }) as Box<dyn FnMut(_)>);
    }

    pub async fn tick(&mut self) {
        let _ = self.channel.port2().post_message(&wasm_bindgen::JsValue::NULL);
        let _ = self.rx.next().await;
    }
}


#[derive(Clone)]
pub struct AppState {
    pub state: ReadSignal<Msg>,

    pub count: RwSignal<usize>,
    pub terminal_display: [[RwSignal<usize>; 80]; 24],
    pub terminal_lines: [[RwSignal<usize>; 3]; 24],
}

impl AppState {
    pub fn new(read: ReadSignal<Msg>, cx: Scope) -> AppState {
        let terminal_display: [[RwSignal<usize>; 80]; 24] =
            arr![create_row(cx); 24];

        let terminal_lines: [[RwSignal<usize>; 3]; 24] =
            arr![create_line_row(cx); 24];

        return AppState {
            count: create_rw_signal(cx, 0 as usize),
            state: read,
            terminal_display,
            terminal_lines,
        };
    }
}

fn create_row(cx: Scope) -> [RwSignal<usize>; 80] {
    return arr![create_rw_signal(cx, 0); 80];
}

fn create_line_row(cx: Scope) -> [RwSignal<usize>; 3] {
    return arr![create_rw_signal(cx, 0); 3];
}
