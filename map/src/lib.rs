fn mulberry32(a: u32) -> impl FnMut() -> u32 {
    let mut state = a;
    return move || {
        (state, _) = state.overflowing_add(0x6D2B79F5);
        let mut z = state;
        (z, _) = (z ^ (z >> 15)).overflowing_mul(z | 1);

        let past_z = z;
        z = z
            .overflowing_add((z ^ (z >> 7)).overflowing_mul(z | 61).0)
            .0;
        z = past_z ^ z;
        return z ^ (z >> 14);
    };
}

pub const MAP_SIZE: usize = 512;
pub const BUILDING_SIZE: usize = 10;
pub const BUILDING_COUNT: usize = 25;

pub struct Map {
    pub seed: u32,
    board: [[u8; MAP_SIZE]; MAP_SIZE],
}

impl Map {
    pub fn new(seed: u32) -> Map {
        let mut map = Map {
            seed,
            board: [[0; MAP_SIZE]; MAP_SIZE],
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
                    (m32() % (MAP_SIZE - BUILDING_SIZE) as u32) as usize,
                    (m32() % (MAP_SIZE - BUILDING_SIZE) as u32) as usize,
                )
            })
            .collect();

        for (x, y) in &random_points {
            for x in *x..*x + BUILDING_SIZE {
                for y in *y..*y + BUILDING_SIZE {
                    self.board[x][y] = 1;
                }
            }
        }

        return random_points;
    }
}

