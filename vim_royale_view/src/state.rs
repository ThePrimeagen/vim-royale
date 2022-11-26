use arr_macro::arr;
use leptos::*;
use crate::message::Msg;

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
