export function makeSafeFileName(name) {
    return name.replace(/\.\./g, '');
}
export function encodeUrlName(name) {
    let result = name.replace(/\:/g, '');
    result = result.replace(/ - /g, '-');
    result = result.replace(/\W/g, '-');
    return result.replace(/--/g, '-');
}
