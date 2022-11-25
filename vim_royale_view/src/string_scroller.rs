use crate::state::AppState;

pub fn str_to_vec_usize(string: String) -> Vec<usize> {
    let mut vec: Vec<usize> = vec![];

    for c in string.chars() {
        let digit = c.to_digit(10).unwrap_or(0) as usize;
        vec.push(digit);
    }

    return vec;
}


pub fn the_primeagen(art_filename: &str) -> Vec<Vec<usize>> {
    let mut result: Vec<String> = vec![];
    let file_content: String = fs::read_to_string(art_filename).expect("Error when trying to read the file");
    for line in file_content.lines() { result.push(str_to_vec_usize(line.into())); }

    result
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
