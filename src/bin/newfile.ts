
type MyData = {
    foo: number
}

async function service(): Promise<MyData> { // <_____ HARD TO TEST
    return new Promise(res => res({
        foo: 69
    }));
}


function doesTheWork(data: MyData) { //< --- -EASY TO TEST
}

