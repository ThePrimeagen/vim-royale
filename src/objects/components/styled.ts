import {Component} from '../../entities';

export type StyledOpts = {
    bold?: boolean
};

// What we render
export default class StyledComponent implements Component {
    public static type: string = "styled";
    type: string = "styled";
    bold: boolean

    constructor(opts: StyledOpts = {}) {
        this.bold = opts.bold;
    }

    applyStyle(char: string[][]) {
        char[0][0] = "{#FF0000-bg}{#96A537-fg}" + char[0][0];
        const last = char[0].length;
        char[0][last - 1] = char[0][last - 1] + "{/#96A537-fg}{/#FF0000-bg}";
    }
}

