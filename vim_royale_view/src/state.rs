use anyhow::Result;
use futures::{StreamExt, channel::mpsc::{Sender, Receiver}};

use array_macro::array;
use leptos::*;
use crate::message::Msg;

pub const WIDTH: usize = 80;
pub const HEIGHT: usize = 24;
pub const TOTAL: usize = WIDTH * HEIGHT;

pub const WIDTH_RELATIVE: usize = 3;
pub const TOTAL_RELATIVE: usize = WIDTH_RELATIVE * HEIGHT;

#[derive(Clone)]
pub struct AppState {
    pub state: ReadSignal<Msg>,

    pub count: RwSignal<usize>,
    pub terminal_display: [RwSignal<usize>; TOTAL],
    pub terminal_lines: [RwSignal<usize>; TOTAL_RELATIVE],
}

impl AppState {
    pub fn new(read: ReadSignal<Msg>, cx: Scope) -> AppState {
        let terminal_display: [RwSignal<usize>; TOTAL] =
            array![create_rw_signal(cx, 0); TOTAL];

        let terminal_lines: [RwSignal<usize>; TOTAL_RELATIVE] =
            array![create_rw_signal(cx, 0); TOTAL_RELATIVE];

        return AppState {
            count: create_rw_signal(cx, 0 as usize),
            state: read,
            terminal_display,
            terminal_lines,
        };
    }
}
