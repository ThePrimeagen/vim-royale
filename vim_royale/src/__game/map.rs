

pub struct Map {
    pub seed: u32;
    pub map: [[u8; 512]; 512],
}

impl Map {
    pub fn new(seed: u32) -> Map {
        return {
            seed,
            map: [[0u8, 512]; 512],
        };
    }
}

#[cfg(test)]
mod test {
    use super::mulberry32;

    #[test]
    fn mulberry32() {
        let mulberrydesnuts = mulberry32(0xBABECAFE);
        println!("mulberry32", mulberrydesnuts());
        println!("mulberry32", mulberrydesnuts());
        println!("mulberry32", mulberrydesnuts());
        println!("mulberry32", mulberrydesnuts());
        assert_eq!("1", "2");
    }
}


