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
        let cols_in_display = state.terminal_display[0].len();

        for row in 0..rows {
            leptos::log!("row: {}", row);
            if cols_in_display > offset {
                leptos::log!("blanking row from 0 .. {}", cols - offset);
                for _ in 0..(cols - offset) {
                    state.terminal_display[row][offset].set(0);
                }
            }

            let row = start_row + row;
            leptos::log!("row selected is {}", row);
            for i in 0..=offset {
                let col = cols_in_display - offset + i - 1;
                leptos::log!(
                    "setting value rows={}, display_cols={} cols={} row={} col={} i={}",
                    rows,
                    cols_in_display,
                    cols,
                    row,
                    col,
                    i
                );
                if let Some(r) = state.terminal_display.get(row) {
                    if let Some(signal) = r.get(col) {
                        leptos::log!("setting signal with {}", strings[row][col]);
                        signal.set(strings[row][col]);
                    } else {
                        leptos::log!("unable to get col {}", col);
                    }
                } else {
                    leptos::log!("unable to get row {}", row);
                }
                state.terminal_display[row][col].set(strings[row][i]);
            }
        }

        offset += 1;
        let still_running = offset < strings[0].len();
        if !still_running {
            offset = 0;
        }

        return still_running;
    };
}
