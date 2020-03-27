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
    private styles: StyleOpts;
    private styleTags: StyleTags;

    constructor(opts: StyleOpts = {}) {
        this.styles = opts;
        this.styleTags = this._buildTags();
    }

    buildChar(char: string) {
        const newChar: string[][] = [char.split("")];
        const [openingTags, closingTags] = this.styleTags;

        newChar[0][0] = `${openingTags}` + newChar[0][0];
        const last = newChar[0].length;
        newChar[0][last - 1] = newChar[0][last - 1] + `${closingTags}`;

        return newChar;
    }

    private _buildTags() {
        const styleTags: StyleTags = ['', ''];

        Object.keys(this.styles).forEach((styleKey)  => {
            decorators[styleKey](styleTags, this.styles[styleKey]);
        })

        return styleTags;
    }
}
