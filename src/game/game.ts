import blessed from "blessed";

export class Game {
}

const screen = blessed.screen();

screen.on("keypress", (_, info) => {
    if (info.full === "C-c") {
        process.exit(0);
    }
});

var box = blessed.box({
    top: 'center',
    left: 'center',
    width: 80,
    height: 24,
    content: 'Hello {bold}world{/bold}!', // figure out
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'magenta',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
    }
});
screen.append(box);
screen.render();
