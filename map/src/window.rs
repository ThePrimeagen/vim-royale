pub struct Window<T> {
    width: usize,
    data: Vec<T>,
}

impl<T> Window<T> {
    pub fn new(width: usize, data: Vec<T>) -> Self {
        return Window { width, data };
    }
}

#[derive(Clone, Copy)]
pub struct SubWindow {
    pub x: usize,
    pub y: usize,
    pub width: usize,
    pub height: usize,
}

impl<T> Window<T> {
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

    pub fn iter_mut_subwindow_rows(
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
