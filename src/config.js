const apiPath = '/api/public/v2';
export const sandboxUrl = `https://sandbox.uat.libertasfms.com${apiPath}`;
export const productionUrl = `https://api.libertasfms.com${apiPath}`;

export function resolveBaseUrl(options) {
    const host = options.host === undefined ? globalThis.process?.env?.LIBERTAS_API_HOST : options.host;
    if (host === undefined) {
        return options.environment === 'production' ? productionUrl : sandboxUrl;
    }

    const url = typeof host === 'string' ? URL.parse(host) : null;
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url?.hostname);
    // Check the raw authority for empty userinfo and the raw URL for empty query/fragment markers.
    if (!url || !/^https?:\/\/[^/\\?#\s]+\/?$/i.test(host) ||
        /[@?#]/.test(host) || url.username || url.password ||
        (url.protocol !== 'https:' && !(loopback && url.protocol === 'http:'))) {
        throw new TypeError('Libertas API host must be an HTTPS origin (HTTP is allowed for loopback)');
    }
    return url.origin + apiPath;
}
