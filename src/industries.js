import axios from 'axios';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Industries {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
    }
    async getIndustries() {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/industries`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
