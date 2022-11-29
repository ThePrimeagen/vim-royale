pub fn mulberry32(a: u32) -> impl FnMut() -> u32 {
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

