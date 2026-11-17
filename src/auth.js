import axios from './http.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Auth {
    constructor(options) {
        this.token = options.token;
        this.environment = options.environment;
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
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const authResult = await axios.get(`${baseUrl}/auth`, { params: { api_key: this.token } });
        if (authResult.data?.data?.token) {
            this.session = authResult.data?.data?.token;
            return authResult.data?.data?.token;
        }
        throw new Error('Authentication response did not contain a session token');
    }
}
