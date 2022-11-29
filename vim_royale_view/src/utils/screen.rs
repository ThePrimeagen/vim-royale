use map::window::{Offset, Window};

use crate::state::{RenderState, COLS, ROWS};

pub struct Screen
{
    pub map: Window<ROWS, COLS>,
}

impl Screen
{
    pub fn new() -> Self {
        let map: Window<ROWS, COLS> = Window::new();
        return Screen { map };
    }

    // TODO: How to make this take in the iterator instead of window + sub window
    pub fn draw<const R: usize, const C: usize>(
        &mut self,
        window: &Window<R, C>,
        offset: Option<Offset>,
    ) {
        self.map.write(window, offset);
    }

    pub fn render(&self, render_state: &'static RenderState) {
        for row in 0..ROWS {
            leptos::log!("HELLO WORLD {}", row);
            for cols in 0..COLS {
                let index = row * COLS + cols;
                render_state.terminal_display[index].set(self.map.data[row][cols]);
            }
        }
    }
}
