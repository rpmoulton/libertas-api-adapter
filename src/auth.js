import axios from './http.js';
import { resolveBaseUrl } from './config.js';

export default class Auth {
    constructor(options) {
        this.token = options.token;
        this.environment = options.environment;
        this.baseUrl = resolveBaseUrl(options);
        this.session = undefined;
        this.pendingSession = undefined;
    }

    async auth() {
        if (this.session) return this.session;
        if (!this.pendingSession) {
            this.pendingSession = this.fetchSession();
        }
        try {
            return await this.pendingSession;
        } finally {
            this.pendingSession = undefined;
        }
    }

    async fetchSession() {
        const authResult = await axios.get(`${this.baseUrl}/auth`, { params: { api_key: this.token } });
        const body = authResult.data;
        const token = body?.data?.token ?? body?.token;
        if (body?.success !== false && typeof token === 'string' && token.trim()) {
            this.session = token;
            return token;
        }
        throw new Error('Authentication response did not contain a session token');
    }
}
