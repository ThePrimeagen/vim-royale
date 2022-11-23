use leptos::*;
use crate::message::Msg;

#[derive(Clone)]
pub struct State {
    pub read: ReadSignal<Msg>
}


