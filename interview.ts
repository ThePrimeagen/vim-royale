const d = [
    "abba",
    "abcd",
];

function sherlockMe(a: string) {

    const table = {};
    for (let i = 0; i < a.length; ++i) {
        let tmp = a[i];

        if (!table[tmp]) {
            table[tmp] = 0;
        }

        table[tmp]++;

        for (let j = i + 1; j < a.length; ++j) {
            tmp += a[j];

            const sort = tmp.split('').sort().join('');
            if (!table[sort]) {
                table[sort] = 0;
            }
            table[sort]++;
        }
    }

    let count = 0;
    for (const k in table) {
        if (table[k] > 1) {
            count += table[k] * (table[k] - 1) / 2;
        }
    }
    return count;
}





console.log(d.map(sherlockMe));
