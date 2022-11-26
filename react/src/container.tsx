import { Status } from "./status";
import { Terminal } from "./terminal";

function Background() {
    return (
        <div>
            <img className="animu" alt="animu" src="https://raw.githubusercontent.com/ThePrimeagen/anime/master/oskr_the_primeagen_6371be34-bd8a-4643-82c1-d480ec36ea29.png"/>
            <div className="background center">
            </div>
        </div>
    );
}

export function VimRoyale() {
    return (
        <div className="tokyonight">
            <div>
                <Background />
            </div>

            <div className="center">
                <Status />
            </div>

            <div className="center">
                <Terminal />
            </div>

        </div>
    );
}

