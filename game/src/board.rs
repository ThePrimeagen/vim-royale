fn mulberry32(a: u32) -> impl FnMut() -> u32 {
    let mut state = a;
    return move || {
        (state, _) = state.overflowing_add(0x6D2B79F5);
        let mut z = state;
        (z, _) = (z ^ (z >> 15)).overflowing_mul(z | 1);

        let past_z = z;
        z = z.overflowing_add((z ^ (z >> 7)).overflowing_mul(z | 61).0).0;
        z = past_z ^ z;
        return z ^ (z >> 14);
    };
}

pub struct Map {
    seed: u32,
    board: [[u8; 256]; 256],
}


impl Map {
    pub fn new(seed: u32) -> Map {
        let mut map = Map {
            seed,
            board: [[0; 256]; 256],
        };

        map.generate();

        return map;
    }

    pub fn generate(&mut self) -> Vec<(usize, usize)> {
        let mut m32 = mulberry32(self.seed);
        let random_points: Vec<(usize, usize)> = (0..10)
            .map(|_| ((m32() % 246) as usize, (m32() % 246) as usize))
            .collect();

        for (x, y) in &random_points {
            for x in *x..*x + 10 {
                for y in *y..*y + 10 {
                    self.board[x][y] = 1;
                }
            }
        }

        return random_points;
    }
}
