export function stringToIntHash(str: string, upperbound=500, lowerbound=0) {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
        result = result + str.charCodeAt(i);
    }

    return (result % (upperbound - lowerbound)) + lowerbound;
}

export function reverseString(str: string) {
    return str.split("").reverse().join("");
}