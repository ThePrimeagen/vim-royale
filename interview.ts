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

const startDay = 2;
const dayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
let sum = 0;
const daySums = [];
for (let i = 0; i < 12; ++i) {
    sum += dayCounts[i];
    daySums[i] = sum;
}

// "Find all the Sundays that are the first of the month from 1901-2000"
// "Find all the Sundays that are the first of the month from 1901-2000"
// "Find all the Sundays that are the first of the month from 1901-2000"
function getDaysToThisMonth(month: number): number {
    const years = Math.floor(month / 12);
    const thisMonth = month % 12;
    let leapYears = 0;
    if (years > 3) {
        leapYears = Math.floor((years - 3) / 4);

        if (thisMonth <= 1) {
            leapYears--;
        }
    }
    else if (years === 3 && thisMonth > 1) {
        leapYears = 1;
    }

    let days = daySums[month % 12];

    return years * 365 + leapYears + days;
}

// "Find all the Sundays that are the first of the month from 1901-2000"
function getTheSundays() {
    /*
    const months = 100 * 12;
    let count = 0;
    for (let i = 0; i < months; ++i) {
        count += ((getDaysToThisMonth(i) + 2) % 7 === 0) ? 1 : 0;
    }
     */

    const date = new Date('1901-01-01');
    const months = 100 * 12;
    let count = 0;
    for (let i = 0; i < months; ++i) {
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);

        console.log(date, date.getDay());
        if (date.getDay() === 0) {
            count++;
        }
    }

    return count;
}

console.log("Sundays", getTheSundays());
