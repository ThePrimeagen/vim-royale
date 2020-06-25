import * as blessed from "blessed";

import {EventType} from "../events";
import {ScreenType, LocalContext} from "../context";
import insert from "./insert";
import normal from "./normal";
import mainMenu from "./normal";
import getLogger from "../logger";

const logger = getLogger("InputHandler");

type InputHandler = {
    handle: (context: LocalContext, ch: string, ctrl?: boolean) => boolean;
    exit: () => void;
    enter: () => void;
};

const inputMap: {
    [key: string]: InputHandler;
} = {
    [ScreenType.Normal]: normal,
    [ScreenType.Insert]: insert,
    [ScreenType.MainMenu]: mainMenu,
};

export default function captureInput(screen: blessed.Widgets.Screen, context: LocalContext) {

    screen.on("keypress", function(_, key) {
        const inputFn = inputMap[context.screen];
        logger("Got Input", context.id, key.name, key.ctrl, key);

        // @ts-ignore because it actually has that as a property when using
        // "." or ","
        const letter = key.name || key.ch;

        if (inputFn && inputFn.handle(context, letter, key.ctrl)) {
            context.events.emit({
                type: EventType.Run
            });
        }
    });
};
