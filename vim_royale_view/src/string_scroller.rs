use crate::state::AppState;

pub fn str_to_vec_usize(string: String) -> Vec<usize> {
    let mut vec: Vec<usize> = vec![];

    for c in string.chars() {
        let digit = c.to_digit(10).unwrap_or(0) as usize;
        vec.push(digit);
    }

    return vec;
}

pub fn the_primeagen() -> Vec<Vec<usize>> {
    return vec![
        str_to_vec_usize(
            "2222220221122022222202222220222222000220002202202222220002222022222202222220202122"
                .into(),
        ),
        str_to_vec_usize(
            "2222220221122022000002222220222222000220002020202200000220022022000002200000220122"
                .into(),
        ),
        str_to_vec_usize(
            "0022000222222022220002200220220022000220002020202222000220022022000002222000222122"
                .into(),
        ),
        str_to_vec_usize(
            "0022000222222022220002222220222222000220002121202222000222222022022202222000212222"
                .into(),
        ),
        str_to_vec_usize(
            "1122110220022022222202200000222200000220002121202222220220022022002202222220212222"
                .into(),
        ),
        str_to_vec_usize(
            "1122110220022022222202200000220022000220002121202222220220022022222202222220212022"
                .into(),
        ),
    ];
}

pub fn scroll_strings(
    strings: Vec<Vec<usize>>,
    start_row: usize,
) -> impl FnMut(AppState, usize) -> bool {
    let mut offset = 0;
    let rows = strings.len();
    let cols = strings[0].len();

    return move |state: AppState, speed: usize| {
        let display_cols = state.terminal_display[0].len();

        offset += 1;

        for row in 0..rows {
            if display_cols > offset {
                for _ in 0..(cols - offset) {
                    state.terminal_display[row][offset].set(0);
                }
            }

            let row = start_row + row;
            let start = offset.saturating_sub(display_cols);

            let mut display_offset = 0;
            for i in start..offset {
                let display_col = (display_cols.saturating_sub(offset) + display_offset).saturating_sub(1);
                display_offset += 1;

                if i < cols {
                    state.terminal_display[row][display_col].set(strings[row][i]);
                } else {
                    state.terminal_display[row][display_col].set(0);
                }
            }
        }

        let still_running = offset < cols + display_cols;
        if !still_running {
            offset = 0;
        }

        return still_running;
    };
}
