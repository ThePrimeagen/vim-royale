export default function log(sync: boolean, str: string, cb?: () => void) {
    console.log(str);

    if (cb) {
        cb();
    }
};

