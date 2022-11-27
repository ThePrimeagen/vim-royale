import { useEffect, useState } from "react";
import { Scroller, thePrimeagen } from "./scroller";

function TerminalRelativeNu() {
    const els = new Array(24).fill(0).map((_, i) => {
        return (
            <div key={i} className="terminal-column">
                {new Array(3).fill(0).map((_, i) => <div key={i} className="terminal-byte"> </div>)}
            </div>
        );
    });

    return (
        <div className="terminal-relative-nu">
            {els}
        </div>
    );
}

function getStr(value: number): string {
    switch (value) {
        case 0: return "off";
        case 1: return "partial";
        default: return "on";
    }
}

function TerminalDisplay(props: {display: number[][]}) {
    let display = props.display;
    const els = display.map((row, i) => {
        const items = row.map((v, i) => {
            return <div key={i} className={`terminal-byte ${getStr(v)}`}>
            </div>;

        });
        return items;
    });

    return (
        <div className="terminal-display">
            {els}
        </div>
    );;
}

function createTerminal(): number[][] {
    return new Array(24).fill(0).map(_ => {
        return new Array(80).fill(0);
    });
}

class Display {
    public display: number[][];
    constructor(display: number[][] = createTerminal()) {
        this.display = display;
    }
}

let count = 0;
let now = Date.now();
export function Terminal() {
    const [display, setDisplay] = useState(new Display());
    const [scroller, _s] = useState(new Scroller(thePrimeagen(), 0));
    const [scroller2, _s2] = useState(new Scroller(thePrimeagen(), 12));

    useEffect(() => {
        //const id = setInterval(() => { TODO: This slows down react to be in sync with wasm
        count++;
        if (!scroller.run(display.display)) {
            console.log("count", count, "taken", Date.now() - now);
            count = 0;
            now = Date.now();
        }

        scroller2.run(display.display);
        // shallow copies of the data
        setDisplay(new Display(display.display));
        //}, 0);
        //return () => clearTimeout(id);
    }, [display]);

    return (
        <div className="terminal">
            <TerminalRelativeNu />
            <TerminalDisplay display={display.display} />
        </div>
    );;
}

