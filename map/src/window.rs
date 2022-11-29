/*
#[derive(Debug)]
pub struct Vec2D<T> {
    width: usize,
    data: Vec<T>,
}

impl<T> Vec2D<T> {
    pub fn new(width: usize, data: Vec<T>) -> Self {
        return Vec2D { width, data };
    }
}
*/

#[derive(Clone, Copy)]
pub struct Offset {
    pub col: usize,
    pub row: usize,
}

impl Offset {
    pub fn new(col: usize, row: usize) -> Offset {
        return Offset { col, row };
    }
}

pub struct Window<const ROWS: usize, const COLS: usize> {
    pub data: [[usize; COLS]; ROWS],
}

impl<const R: usize, const C: usize> Window<R, C> {
    pub fn new() -> Self {
        return Window {
            data: [[usize::default(); C]; R],
        };
    }

    pub fn write<const ROW: usize, const COL: usize>(
        &mut self,
        other: &Window<ROW, COL>,
        offset: Option<Offset>,
    ) {
        let offset = offset.unwrap_or(Offset::new(0, 0));

        for row in 0..ROW {
            for col in 0..COL {
                self.data[row + offset.row][col + offset.col] = other.data[row][col];
            }
        }
    }

    pub fn outline(&mut self, value: usize) {
        for row in 0..R {
            for col in 0..C {
                if row == 0 || row == R - 1 {
                    self.data[row][col] = value;
                } else if col == 0 || col == C - 1 {
                    self.data[row][col] = value;
                }
            }
        }
    }

    pub fn sub_window<const ROW: usize, const COL: usize>(
        &mut self,
        other: &mut Window<ROW, COL>,
        offset: Option<Offset>,
    ) {
        let offset = offset.unwrap_or(Offset::new(0, 0));

        for row in 0..ROW {
            for col in 0..COL {
                other.data[row][col] = self.data[row + offset.row][col + offset.col];
            }
        }
    }

}

/*
impl<T> Vec2D<T> {
    pub fn iter_subwindow_rows(
        &self,
        SubWindow {
            x,
            y,
            width,
            height,
        }: SubWindow,
    ) -> impl Iterator<Item = &[T]> {
        let rows = self.data.chunks(self.width);
        let filtered_rows = rows.skip(y).take(height);
        let filtered_cols = filtered_rows.map(move |chunk| &chunk[x..x + width]);
        return filtered_cols;
    }

    pub fn iter_subwindow_rows_mut(
        &mut self,
        SubWindow {
            x,
            y,
            width,
            height,
        }: SubWindow,
    ) -> impl Iterator<Item = &mut [T]> {
        let rows = self.data.chunks_mut(self.width);
        let filtered_rows = rows.skip(y).take(height);
        let filtered_cols = filtered_rows.map(move |chunk| &mut chunk[x..x + width]);
        return filtered_cols;
    }
}
*/
