import * as blessed from 'blessed';

import createRenderer from './renderer';
import Player from './objects/player';

const screen = blessed.screen({
    smartCSR: true
});

screen.title = 'Vim Royale';

const renderer = createRenderer(screen);

const player = new Player(15, 15, 'X');
const map = {
    width: 80,
    height: 24,
};

process.stderr.write(`Player: ${player}`);
renderer.addPlayer(player);
renderer.render();

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.key(['h', 'j', 'k', 'l'], function(ch, key) {
    process.stderr.write(`Got key ${ch}\n`);

    switch (ch) {
        case 'h':
            process.stderr.write(`H?\n`);
            if (player.x > 0) {
                process.stderr.write(`H YES?\n`);
                player.x--;
                process.stderr.write(`H YES ${player.x}\n`);
            }
            break;

        case 'l':
            if (player.x < map.width) {
                player.x++;
            }
            break;
        case 'j':
            if (player.y > 0) {
                player.y--;
            }
            break;

        case 'k':
            if (player.y < map.height) {
                player.y++;
            }
            break;
    }

    renderer.render();
});

process.on('uncaughtException', function(err) {
    console.error("Hello world");
    console.error(err.message);
    console.error(err.stack);
});

/*
// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Hello {bold}world{/bold}!',
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

// Append our box to the screen.
screen.append(box);
/*

// Add a png icon to the box
// @ts-ignore
const icon = blessed.image({
    parent: box,
    top: 0,
    left: 0,
    type: 'overlay',
    width: 'shrink',
    height: 'shrink',
    file: __dirname + '/my-program-icon.png',



// If our box is clicked, change the content.
box.on('click', function(data) {
    box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
    screen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
box.key('enter', function(ch, key) {
    box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
    box.setLine(1, 'bar');
    box.insertLine(1, 'foo');
    screen.render();
});

// Focus our element.
box.focus();

*/
