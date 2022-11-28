pub struct Window<'a, T> {
    width: usize,
    stuff: &'a Vec<T>,
}

#[derive(Clone, Copy)]
pub struct SubWindow {
    x: usize,
    y: usize,
    width: usize,
    height: usize,
}

impl<'a, T> Window<'a, T> {
    pub fn iter_subwindow_rows(
        &self,
        SubWindow {
            x,
            y,
            width,
            height,
        }: SubWindow,
    ) -> impl Iterator<Item = &'a [T]> {
        let rows = self.stuff.chunks(self.width);
        let filtered_rows = rows.skip(y).take(height);
        let filtered_cols = filtered_rows.map(move |chunk| &chunk[x..x + width]);
        return filtered_cols;
    }
}

#[cfg(test)]
mod test {
    use super::Window;


    #[test]
    fn run_iter() {

        let vec = vec![
            vec![1, 2, 3, 4, 5],
            vec![6, 7, 8, 9, 10],
            vec![11, 12, 13, 14, 15],
            vec![16, 17, 18, 19, 20],
        ];

        let window = Window {
            width: 5,
            stuff: &vec,
        };
    }

}
