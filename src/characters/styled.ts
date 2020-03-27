import { CharacterStrategy } from "../objects/components/position";

type StyleOpts = {
    bold?: boolean;
    fg?: string;
    bg?: string;
};

type StyleTags = [string, string];

const decorators = {
    bold(styleTags: StyleTags, enabled: boolean) {
        // only add tags if enabled is `true`
        if (enabled) {
            buildTag(styleTags, 'bold');
        }
    },
    fg(styleTags: StyleTags, rgb: string) {
        buildTag(styleTags, `#${rgb}-fg`);
    },
    bg(styleTags: StyleTags, rgb: string) {
        buildTag(styleTags, `#${rgb}-bg`);
    }
}

function buildTag(styleTags: StyleTags, tag: string) {
    styleTags[0] = `{${tag}}` + styleTags[0];
    styleTags[1] = styleTags[1] + `{/${tag}}`;
}

export default class StyledCharacterStrategy implements CharacterStrategy {
    private styleTags: StyleTags;
    private _char: string[][];

    get char() {
        return this._char;
    }

    constructor(chars: string, opts: StyleOpts = {}) {
        this.styleTags = this._buildTags(opts);
        this.setChar(chars);
    }

    setChar(char: string) {
        const newChar: string[][] = [char.split("")];
        const [openingTags, closingTags] = this.styleTags;

        newChar[0][0] = `${openingTags}` + newChar[0][0];
        const last = newChar[0].length;
        newChar[0][last - 1] = newChar[0][last - 1] + `${closingTags}`;

        this._char = newChar;
    }

    private _buildTags(styles) {
        const styleTags: StyleTags = ['', ''];

        Object.keys(styles).forEach((styleKey)  => {
            decorators[styleKey](styleTags, styles[styleKey]);
        })

        return styleTags;
    }
}
