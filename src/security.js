export function resourceId(value) {
    if (Number.isSafeInteger(value) && value >= 0) {
        value = String(value);
    }
    if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f]/u.test(value) ||
        value === '.' || value === '..') {
        throw new TypeError('A non-empty resource ID or a non-negative safe integer is required');
    }
    return value;
}

export function pathSegment(value) {
    return encodeURIComponent(resourceId(value));
}

export function appendFormField(form, name, value, options) {
    try {
        form.append(name, value, options);
    } catch {
        // Multipart builders can embed invalid field values in their errors.
        throw new TypeError('Invalid multipart form field');
    }
}
