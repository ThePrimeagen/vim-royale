use std::collections::HashMap;


/* [TO DO]
    - generate ascii art from raw classic text:
        1) convert classic text to ascii art (need to make a function for this, just iterating through
            chars and convert each chars with 'get_fonts.get("font name").chars.get(&char))
        2) convert ascii art to vim royale readable format (with 'raw_ascii_art_to_vim_royale_readable')
        3) convert it to Vec<Vec<char>> (with 'string_to_matrix')
 *
*/


const FONTS_PATH: &str = "vim_royale_view/src/ascii_art/arts";


struct Font {
    name: String,
    fullpath: String,
    plain_chars: Vec<char>,
    halfplain_chars: Vec<char>,
    empty_chars: Vec<char>,
    dimensions: (u8, u8),
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



fn get_fonts() -> HashMap<String, Font> {
    let mut fonts: HashMap<String, Font> = HashMap::new();

    fonts.insert(String::from("ansi_regular"), Font::new("ansi_regular", vec!['█'], vec![' '], vec![' '], (7, 5)));
    
    // ! TODO: complete fonts dimensions, findable on
    // 'https://www.patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20'
    //
    // fonts.insert(String::from("ansi_shadow"), Font::new("ansi_shadow", vec!['█'], vec!['═', '╝', '╗', '╚', '║'], vec![' '], (?, ?)));
    // fonts.insert(String::from("electronic"), Font::new("electronic", vec!['▄', '▀', '▌', '▐', '█'], vec!['░'], vec![' '], (?, ?)));

    return fonts;
}


fn is_valid_font(fontname: &str) -> bool {
    for (font_name, _) in get_fonts() {
        if fontname == font_name { return true; }
    }

    return false;
}



fn load_font(fontname: &str) -> HashMap<char, String> {
    // Does a infinite recursion with 'get_fonts()' and the 'Font::new()' so I comment this until I
    // find a way to check clearly if the font exists or not, for the moment if font is not
    // loadable, Rust will panic when trying to read the file, maybe fix this with a 'match Ok() Err()'
    //
    // if !is_valid_font(fontname) { panic!("font '{}' unknown (not in AVAILIBLE_FONTS)", fontname); }

    let font_fullpath = format!("{}/{}.txt", FONTS_PATH, &fontname);

    let tmp: _ = std::fs::read_to_string(font_fullpath).expect("unable to load font");
    let ascii_chars = tmp.split("\n\n").collect::<Vec<_>>();

    let mut result: HashMap<char, String> = HashMap::new();

    // from 'A' to 'Z'
    for i in 65..91 {
        result.insert((i as u8) as char, ascii_chars[i - 65].to_string());
    }

    result
}


fn string_to_matrix(s: &str) -> Vec<Vec<char>> {
    let mut result: Vec<Vec<char>> = vec![];
    let mut actual_line: Vec<char> = vec![];

    for line in s.lines() {
        for c in line.chars() { actual_line.push(c); }
        result.push(actual_line);
        actual_line = vec![];
    }

    result
}


fn raw_ascii_art_to_vim_royale_readable(raw_ascii_art: Vec<Vec<char>>, font: Font) -> Vec<Vec<char>> {
    let mut result: Vec<Vec<char>> = vec![];
    let mut actual_line: Vec<char> = vec![];

    for line in raw_ascii_art {
        for c in line {
            if font.plain_chars.contains(&c) { actual_line.push('2'); }
            else if font.halfplain_chars.contains(&c) { actual_line.push('1'); }
            else if font.empty_chars.contains(&c) { actual_line.push('0'); }
            else { panic!("character in raw_ascii_art ('{}') is neither 'plain_char', 'halfplain_char' or 'empty_char'", c); }
        }

        result.push(actual_line);
        actual_line = vec![];
    }

    result
}
