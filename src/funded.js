import axios from 'axios';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Funded {
    constructor(options) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.auth = new Auth(options);
    }

    async getFundedDeals() {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/funded`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
