import * as blessed from 'blessed';

const render = process.env.RENDER !== 'false';

export default function getBox(...args): blessed.Widgets.BoxElement {
    if (render) {
        return blessed.box(...args);
    }

    // @ts-ignore
    return { setContent() {} };
};

