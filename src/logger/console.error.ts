export default function log(sync: boolean, str: string, cb?: () => void) {
    console.error(str);

    if (cb) {
        cb();
    }
};

