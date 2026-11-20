const messages = Object.freeze({
    authentication: 'Libertas authentication failed',
    authorization: 'Libertas request was forbidden',
    invalidSession: 'Authentication response did not contain a session token',
    validation: 'Libertas rejected the request as invalid',
    timeout: 'Libertas request timed out',
    network: 'Libertas request failed without an HTTP response',
    server: 'Libertas server error',
    http: 'Libertas request failed',
});

// Allow only standardized bearer error codes in the statuses where they apply.
const bearerCodes = new Map([
    [400, 'invalid_request'],
    [401, 'invalid_token'],
    [403, 'insufficient_scope'],
]);

export default class LibertasApiError extends Error {
    constructor(kind, status, vendorCode) {
        const safeKind = typeof kind === 'string' && Object.hasOwn(messages, kind) ? kind : 'http';
        super(messages[safeKind]);
        this.name = 'LibertasApiError';
        this.kind = safeKind === 'invalidSession' ? 'authentication' : safeKind;
        if (Number.isInteger(status) && status >= 100 && status <= 599) {
            this.status = status;
            this.response = Object.freeze({ status });
            if (vendorCode !== undefined && vendorCode === bearerCodes.get(status)) {
                this.vendorCode = vendorCode;
            }
        }
    }

    toJSON() {
        const { name, message, kind, status, vendorCode } = this;
        return { name, message, kind, status, vendorCode };
    }
}

export function sanitizeHttpError(error) {
    const { status, data } = error?.response ?? {};
    const expectedCode = bearerCodes.get(status);
    const vendorCode = expectedCode !== undefined &&
        (data?.code === expectedCode || data?.error === expectedCode) ? expectedCode : undefined;

    let kind = 'http';
    if (status === 401) kind = 'authentication';
    else if (status === 403) kind = 'authorization';
    else if (status === 400 || status === 422) kind = 'validation';
    else if (Number.isInteger(status) && status >= 500 && status <= 599) kind = 'server';
    else if (status === undefined) {
        kind = ['ECONNABORTED', 'ETIMEDOUT'].includes(error?.code) ? 'timeout' : 'network';
    }
    return new LibertasApiError(kind, status, vendorCode);
}
