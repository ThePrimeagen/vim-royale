use std::cell::RefCell;

pub const PLAYER_START_POS: (u16, u16) = (12, 12);

pub struct Player {
    pub id: u8,
    pub position: RefCell<(u16, u16)>,
    pub clock_diff: i64,
}

impl Player {
    pub fn new(id: u8, clock_diff: i64) -> Self {
        return Player {
            id,
            position: RefCell::new(PLAYER_START_POS.clone()),
            clock_diff,
        };
    }

    pub fn move_by_keypress(&self, key: String) {
        match key.as_str() {
            "j" => {
                leptos::log!("moving the player down one");
                self.position.borrow_mut().1 += 1;
            },

            "k" => {
                leptos::log!("moving the player up one");
                self.position.borrow_mut().1 -= 1;
            },

            _ => {
                leptos::log!("move_by_keypress but ignored: {}", key);
            }
        }
    }
}

