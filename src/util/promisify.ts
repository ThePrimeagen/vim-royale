export function promisifyCB(task) {
    return new Promise((res, rej) => {
        try {
            task(res);
        } catch (e) {
            rej(e);
        }
    });
}

