use std::path::PathBuf;

use leptos::*;
use anyhow::Result;
use futures::{StreamExt, channel::mpsc::{Sender, Receiver}};

pub struct Tick {
    rx: Receiver<()>,
    channel: web_sys::MessageChannel,
}

fn get_file_size(path: PathBuf) -> Result<usize> {
    let md = std::fs::metadata(path)?;

    return Ok(0);
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



