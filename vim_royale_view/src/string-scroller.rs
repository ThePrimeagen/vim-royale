
pub fn the_primeagen(art_filename: &str) -> Vec<String> {
    let mut result: Vec<String> = vec![];
    let file_content: String = fs::read_to_string(art_filename).expect("Error when trying to read the file");
    for line in file_content.lines() { result.push(line.into()); }

    result
}


pub fn scroll_strings(strings: Vec<String>, pos: (usize, usize)) -> impl Fn(AppState) -> () {
}

