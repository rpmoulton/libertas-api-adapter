export function pathSegment(value) {
    if (Number.isSafeInteger(value) && value >= 0) {
        value = String(value);
    }
    if (typeof value !== 'string' || !value || value === '.' || value === '..') {
        throw new TypeError('A non-empty resource ID or a non-negative safe integer is required');
    }
    return encodeURIComponent(value);
}
