import fs from "fs";
import path from "path";

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "ntoehuntoehuntoehunt")).toString());

// quicksort
function quicksort(arr: number[]): number[] {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return quicksort(left).concat(pivot, quicksort(right));
}










push(foo2);

const fooImpl = foo();

























function foo(): string[] {
    return new Array(10).fill(0);
}

const bar = foo();
bar.forEach(b => console.log(typeof b));

function push(arr : Array<string | number>) {
    arr.push(99);
}

const foo2 : Array<string> = ['foo'];
push(foo2);

function foo(): Promise<{foo: number}> {
    return Promise.resolve({foo: 5});
}

type Thing = { foo: string, } | { bar: string, } | { baz: string };
function thing() {
    const thing = {} as Thing;

    if ("bar" in thing) {
        thing.
    }
}

async function oneMore(): string[] {

    const foo: readonly number[] = [];
    foo.push(45);

    let thing;
    try {
        thing = JSON.parse("{}");
    } catch (e) {
        // handle error
    }

    const out = [];
    for (let i = 0; i < 10; ++i) {
        out.push(i.toString());
    }

    return out;
}



async function one() {
}

async function two() {
}

async function three() {
    (await (await one))

}

function foo() {

    try {
        JSON.parse("{}");
    } catch (e) {
        onetuhonteuh
        return
    }
}


if true {
}
