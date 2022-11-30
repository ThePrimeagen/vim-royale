use std::collections::HashMap;

const FONTS_PATH: &str = "vim_royale_view/src/ascii_art/arts";
const VALID_CHARS: [char; 53] = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    ' ',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];


struct Font {
    name: String,
    fullpath: String,
    plain_chars: Vec<char>,
    halfplain_chars: Vec<char>,
    empty_chars: Vec<char>,
    dimensions: (u8, u8),   // (width, height), the max dimensions
    chars: HashMap<char, String>,
}

impl Font {
    pub fn new(font_name: &str, plain_chars: Vec<char>, halfplain_chars: Vec<char>, empty_chars: Vec<char>, dimensions: (u8, u8)) -> Self {
        return Font{
            name: font_name.to_string(),
            fullpath: format!("{}/{}.txt", FONTS_PATH, font_name).to_string(),
            plain_chars: plain_chars,
            halfplain_chars: halfplain_chars,
            empty_chars: empty_chars,
            dimensions: dimensions,
            chars: load_font(font_name)
        };
    }
}



pub fn get_fonts() -> HashMap<String, Font> {
    let mut fonts: HashMap<String, Font> = HashMap::new();

    fonts.insert(String::from("ansi_regular"), Font::new("ansi_regular", vec!['█'], vec![' '], vec![' '], (10, 5)));
    
    // ! TODO: complete fonts dimensions, findable on, will do it later
    // 'https://www.patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20'
    //
    // fonts.insert(String::from("ansi_shadow"), Font::new("ansi_shadow", vec!['█'], vec!['═', '╝', '╗', '╚', '║'], vec![' '], (?, ?)));
    // fonts.insert(String::from("electronic"), Font::new("electronic", vec!['▄', '▀', '▌', '▐', '█'], vec!['░'], vec![' '], (?, ?)));

    return fonts;
}


pub fn is_valid_font(fontname: &str) -> bool {
    for (font_name, _) in get_fonts() {
        if fontname == font_name { return true; }
    }

    return false;
}



pub fn load_font(fontname: &str) -> HashMap<char, String> {
    // Does a infinite recursion with 'get_fonts()' and the 'Font::new()' so I comment this until I
    // find a way to check clearly if the font exists or not, for the moment if font is not
    // loadable, Rust will panic when trying to read the file, maybe fix this with a 'match Ok() Err()'
    //
    // if !is_valid_font(fontname) { panic!("font '{}' unknown (not in AVAILIBLE_FONTS)", fontname); }


    let font_fullpath = format!("{}/{}.txt", FONTS_PATH, &fontname);

    let tmp: _ = std::fs::read_to_string(font_fullpath).expect("unable to load font");
    let ascii_chars = tmp.split("\n\n\n").collect::<Vec<_>>();

    let mut result: HashMap<char, String> = HashMap::new();

    // from 'A' to 'Z'
    for i in 65..91 { result.insert((i as u8) as char, ascii_chars[i - 65].to_string()); }

    result
}


pub fn generate_fullchar(c: char, dimensions: (u8, u8)) -> String {
    let mut result: String = String::from("");

    for i in 0..dimensions.0 {
        for _j in 0..dimensions.1 {
            result += &String::from(c.to_string());
        }

        if i != dimensions.0 - 1 { result += &String::from("\n"); }
    }

    result
}



// ! YOU ONLY CAN ADD CHARS FROM THE ALPHABET AND SPACE, SEE LINE 4
pub fn create_sentence_from_string(text: String, fontname: &str) -> Vec<Vec<usize>> {
    return create_sentence(text.as_str(), fontname);
}

pub fn create_sentence(text: &str, fontname: &str) -> Vec<Vec<usize>> {
    let fonts = get_fonts();
    let font = fonts.get(&String::from(fontname)).expect("could not load font while creating sentence");

    let mut actual_line: Vec<usize> = vec![];
    let mut result: Vec<Vec<usize>> = vec![];

    let mut ascii_text_splitted: Vec<String> = vec![];
    let mut ascii_char: Option<String> = Some(String::from(""));
    for c in text.to_uppercase().chars() {
        ascii_char = font.chars.get(&c).cloned();
        if &c == &' ' { ascii_char = Some(generate_fullchar(' ', font.dimensions)); }

        match ascii_char {
            Some(art) => ascii_text_splitted.push(art),
            None => panic!("didnt got representation of char '{}'", c),
        }
    }

    // From 0 to ascii art char height
    for i in 0..font.dimensions.1 {
        for ascii_letter in &ascii_text_splitted {
            for c in ascii_letter.lines().collect::<Vec<&str>>()[i as usize].chars() {
                if font.plain_chars.contains(&c) { actual_line.push(2); }
                else if font.halfplain_chars.contains(&c) {
                    if font.empty_chars.contains(&c) && &c == &' ' { actual_line.push(0); }
                    else { actual_line.push(1); }
                } else if font.empty_chars.contains(&c) { actual_line.push(0); }
                else { panic!("character in raw_ascii_art ('{}') is neither 'plain_char', 'halfplain_char' or 'empty_char'", c); }
            }

            // Add a space between each letter
            actual_line.push(0);
        }

        result.push(actual_line);
        actual_line = vec![];
    }

    result
}
