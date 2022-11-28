use crate::state::{HEIGHT, WIDTH};

use super::window::{SubWindow, Window};

pub struct Screen {
    pub map: Vec<Vec<usize>>,
}

pub struct DrawConfig {
    pub offset_x: usize,
    pub offset_y: usize,
    pub x_length: usize,
    pub y_length: usize,
}

impl DrawConfig {
    pub fn new(offset_x: usize, offset_y: usize, x_length: usize, y_length: usize) -> DrawConfig {
        return DrawConfig {
            offset_x,
            offset_y,
            x_length,
            y_length,
        }
    }
}

impl Screen {
    pub fn new() -> Screen {
        return Screen {
            map: vec![vec![0; WIDTH]; HEIGHT],
        };
    }

    // TODO: How to make this take in the iterator instead of window + sub window
    pub fn draw(&mut self, window: &Window<&[usize]>, sub_window: SubWindow) {
        window.iter_subwindow_rows(sub_window).for_each(|row| {
            println!("help me daddy {:?}", row);
        });
    }
}
