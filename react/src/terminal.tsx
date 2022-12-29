import { Fragment, useEffect, useState } from "react";
import { Scroller, thePrimeagen } from "./scroller";

const TerminalRelativeNu = () => {
    console.log("rerender");
    const els = new Array(24).fill(0).map((_, i) => {
        return (
            <div key={i} className="terminal-column">
                {new Array(3).fill(0).map((_, i) => (
                    <div key={i} className="terminal-byte">
                        {" "}
                    </div>
                ))}
            </div>
        );
    });

    return <div className="terminal-relative-nu">{els}</div>;
}

function getStr(value: number): string {
    switch (value) {
        case 0:
            return "off";
        case 1:
            return "partial";
        default:
            return "on";
    }
}


function createTerminal(): number[][] {
    return new Array(24).fill(0).map((_) => {
        return new Array(80).fill(0);
    });
}

class Display {
    public display: number[][];
    constructor(display: number[][] = createTerminal()) {
        this.display = display;
    }
}

let now = Date.now();

const scroller = new Scroller(thePrimeagen(), 0);
const scroller2 = new Scroller(thePrimeagen(), 12);
const display = new Display();

function TerminalDisplay() {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let prevCount = count
        if (!scroller.run(display.display)) {
            console.log("count", prevCount, "taken", Date.now() - now);
            prevCount = 0;
            now = Date.now();
        }
        scroller2.run(display.display);
        setCount(prevCount + 1)
    }, [count])
   
    return (
        <div className="terminal-display">
            {display.display.map((el, idx) => {
                return (
                    <Fragment key={idx}>
                        {el.map((v, index) => (
                            <div
                                key={index}
                                className={`terminal-byte ${getStr(v)}`}
                            ></div>
                        ))}
                    </Fragment>
                );
            })}
        </div>
    );
}


export function Terminal() {

    return (
        <div className="terminal">
            <TerminalRelativeNu />
            <TerminalDisplay  />
        </div>
    );
}
