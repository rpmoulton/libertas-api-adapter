export function pathSegment(value) {
    if (typeof value !== 'string' || !value || value === '.' || value === '..') {
        throw new TypeError('A non-empty resource ID is required');
    }
    return encodeURIComponent(value);
}
