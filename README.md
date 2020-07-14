# vim-royale
* Because Nano sucks.
* Because Emacs sucks.
* Because Rust sucks.
* Because VSCode ~~sucks~~ is okay.

**May the best man *vim*.**
**Cheaters never *vim*.**

# Warning
I have _literally_ done no offline development of this project.  This 
project is purely stream only developed.  So if there are large periods 
of time with no improvement it is due to shiny object syndrome that I have.

If you wish to heckle me streaming this, especially since its my first 
game ever, check out the [Twitch Stream](https://twitch.tv/ThePrimeagen).


# Intro
Vim Royale is a game meant to make you better at vim movements by making a
gamification of Vim itself.  The game is not an educational game, but instead
meant to amplify the learning rate for spinal responses (muscle memory).

Thats a mouthful.  What it means is that the game itself is not "Learning Vim"
as other games are.  There are plenty of vim items that are not present, it is
not meant to _teach_ you how to use vim.  Instead, it will use similar keys to
perform similar actions to help make you better.

# Setup
`npm install`

## Start the server
`npm run s`

## Start the client
`npm run c`

## Inspecting
### Start the server
Inspect
`npm run si`

Inspect Break
`npm run sib`

### Start the client
Inspect
`npm run ci`

Inspect Break
`npm run cib`

## Measuring Perf
```
// Run the server
// REMEMBER THE PID you goon
TICK=50 SERVER=true node --expose-gc --perf-basic-prof-only-functions ./build/test.js &

// Run the client
PLAYER_COUNT=20 SERVER=false node ./node_modules/.bin/ts-node ./src/test.ts

// Run Perf for 100 seconds
sudo perf record -F 99 -p $PID -g -- sleep 100
sudo chown root /tmp/perf-$PID
sudo perf script > nodestacks

// Navigate to FlameGraph github.
./stackcollapse-perf.pl < ../path/to/nodestacks | ./flamegraph.pl --colors js > ../node-flamegraph.svg
```

