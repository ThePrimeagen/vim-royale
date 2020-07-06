import blessed from "blessed";

function flatten(strOrArr: string | string[]): string {
    if (typeof strOrArr === "string") {
        return strOrArr;
    }

    /*
    return strOrArr.flat(2).join('');
    */
    return strOrArr.map(flatten).join('');
}

export class Renderer {
    private screen: blessed.Widgets.Screen;
    private box: blessed.Widgets.BoxElement;

    constructor() {
        this.screen = blessed.screen({
            smartCSR: true
        });

        this.screen.title = "Vim Royale Logger";
        this.box = blessed.box({
            top: 0,
            left: 0,
            content: "Awaiting logs...",
            tags: true,
            border: {
                type: "bg"
            },
        });

        this.screen.append(this.box);
        this.screen.render();
    }

    render(strOrArr: string[][] | string[] | string) {
        // @ts-ignore
        this.box.setContent(flatten(strOrArr));
        this.screen.render();
    }
}
