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
    const els = new Array(display.length).fill(0).map((_, i) => {
        const row = display[i];
        const items = new Array(display[0].length).
            fill(0).
            map((_, i) => <div key={i} className={`terminal-byte`}> </div>)
        return (
            <div key={i} className="terminal-column">
                {}
            </div>
        );
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

export function Terminal() {
    const [display, setDisplay] = useState(new Display());
    const [scroller, _] = useState(new Scroller(thePrimeagen(), 0));
    useEffect(() => {
        const id = setTimeout(() => {
            scroller.run(display.display);

            // shallow copies of the data
            setDisplay(new Display(display.display));
        }, 0);
        return () => clearTimeout(id);
    }, [display]);

    return (
        <div className="terminal">
            <TerminalRelativeNu />
            <TerminalDisplay display={display.display} />
        </div>
    );;
}

