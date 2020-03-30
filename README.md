# vim-royale
* Because Nano sucks.
* Because Emacs sucks.
* Because Rust sucks.
* Because VSCode sucks.

**May the best man *vim*.**

# Setup
`npm install`

## Start the server
`node --expose-gc ./node_modules/.bin/ts-node ./src/server/index.ts`

## Start the client
`ts-node src/index.ts 2> out`

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

