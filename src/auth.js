import axios from 'axios';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Auth {
    constructor(options) {
        this.token = options.token;
        this.environment = options.environment;
        this.session;
    }

    async auth() {
        if (this.session) return this.session;
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const authResult = await axios.get(`${baseUrl}/auth?api_key=${this.token}`);
        if (authResult.data?.data?.token) {
            this.session = authResult.data?.data?.token;
            return authResult.data?.data?.token;
        }
        return authResult;
    }
}
