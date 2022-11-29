use crate::{window::{Window, Offset}, rand::mulberry32};

pub const MAP_SIZE_SIDE: usize = 256;
pub const MAP_SIZE: usize = MAP_SIZE_SIDE * MAP_SIZE_SIDE;
pub const BUILDING_SIZE: usize = 10;
pub const BUILDING_COUNT: usize = 25;

pub struct Map {
    pub seed: u32,
    board: Window<MAP_SIZE_SIDE, MAP_SIZE_SIDE>,
}

impl Map {
    pub fn new(seed: u32) -> Map {
        let mut map = Map {
            seed,
            board: Window::new(),
        };

        map.generate();

        return map;
    }

    pub fn generate(&mut self) -> Vec<(usize, usize)> {
        let mut m32 = mulberry32(self.seed);
        let random_points: Vec<(usize, usize)> = (0..BUILDING_COUNT)
            .map(|_| {
                (
                    // TODO: This should be cleaned up
                    (m32() % (MAP_SIZE_SIDE - BUILDING_SIZE) as u32) as usize,
                    (m32() % (MAP_SIZE_SIDE - BUILDING_SIZE) as u32) as usize,
                )
            })
            .collect();


        for (x, y) in &random_points {
            let mut b: Window<BUILDING_SIZE, BUILDING_SIZE> = Window::new();
            b.outline(1);

            self.board.write(&b, Some(Offset::new(*x, *y)));
        }

        return random_points;
    }
}

