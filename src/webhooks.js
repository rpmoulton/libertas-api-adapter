import axios from 'axios';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Webhooks {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
    }
    
    async registerWebhook(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/webhooks`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
    
    async simulateWebhook(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/webhook/simulate`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
