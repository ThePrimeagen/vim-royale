
fn mulberry32(mut a: u32) -> Fn() -> u32 {
    return fn() {
        a = a.wrapping_add(0x6D2B79F5);
        let t = a;

        // t = Math.imul(t ^ t >>> 15, t | 1);
        let t1 = t ^ (t >>> 15);
        let t = t1.wrapping_mul(t | 1);

        // t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        let t = t ^ (t.wrapping_add((t ^ (t >>> 7)).wrapping_mul(t | 61)));

        // return ((t ^ t >>> 14) >>> 0) / 4294967296;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

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


