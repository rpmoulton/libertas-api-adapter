import axios from './http.js';
import Auth from './auth.js';

export default class Webhooks {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }
    
    async registerWebhook(options) {
        const sessionToken = await this.auth.auth();
        return axios.post(`${this.baseUrl}/webhooks`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
    
    async simulateWebhook(options) {
        if (this.environment === 'production') {
            throw new Error('Webhook simulation is available only in sandbox mode');
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${this.baseUrl}/webhooks/simulate`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
