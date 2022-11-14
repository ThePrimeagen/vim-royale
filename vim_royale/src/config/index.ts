const _isJson = process.argv[2] === "json";

export function isJson(): boolean {
    return _isJson;
}

