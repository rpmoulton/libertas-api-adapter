import { request } from './http.js';
import LibertasApiError from './api-error.js';
import { resolveBaseUrl } from './config.js';

export default class Auth {
    #session;
    #pendingSession;

    constructor(options) {
        this.token = options.token;
        this.environment = options.environment;
        this.baseUrl = resolveBaseUrl(options);
    }

    async auth() {
        return (await this.#getSession()).token;
    }

    async #getSession() {
        if (this.#session) return this.#session;
        this.#pendingSession ??= this.#login();
        return this.#pendingSession;
    }

    async #login() {
        try {
            const token = await this.fetchSession();
            this.#session = { token };
            return this.#session;
        } finally {
            this.#pendingSession = undefined;
        }
    }

    async fetchSession() {
        const authResult = await request({
            method: 'get',
            url: `${this.baseUrl}/auth`,
            params: { api_key: this.token },
        });
        const body = authResult.data;
        const token = body?.data?.token ?? body?.token;
        if (body?.success !== false && typeof token === 'string' && token.trim()) {
            return token;
        }
        throw new LibertasApiError('invalidSession');
    }

    #recover(session) {
        // A late 401 can share recovery even after it has settled. It must
        // never evict a newer session, even if the vendor reissued the token.
        if (this.#session === session) {
            this.#session = undefined;
            session.recovery = this.#getSession();
        }
        return session.recovery;
    }

    async request(config) {
        const send = session => request({
            ...config,
            headers: { ...config.headers, Authorization: `Bearer ${session.token}` },
        });
        const session = await this.#getSession();
        try {
            return await send(session);
        } catch (error) {
            if (error.status !== 401) throw error;

            const recovery = this.#recover(session);
            if (config.method !== 'get') {
                // Recover the session for later calls while preserving the write's failure.
                await recovery?.catch(() => {});
                throw error;
            }

            const renewed = await recovery;
            if (!renewed || !this.#session) throw error;

            const retrySession = this.#session;
            try {
                return await send(retrySession);
            } catch (retryError) {
                if (retryError.status === 401 && this.#session === retrySession) {
                    this.#session = undefined;
                }
                throw retryError;
            }
        }
    }
}
