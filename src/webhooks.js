import axios from './http.js';
import Auth from './auth.js';
import { sandboxUrl } from './config.js';
import { resourceId } from './security.js';

export default class Webhooks {
    #sandboxSimulation;

    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
        this.#sandboxSimulation = options.environment !== 'production' && this.baseUrl === sandboxUrl;
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
        if (!this.#sandboxSimulation || this.baseUrl !== sandboxUrl || this.auth.baseUrl !== sandboxUrl) {
            throw new Error('Webhook simulation is available only on the Libertas sandbox in sandbox mode');
        }
        const payload = { ...options, deal_id: resourceId(options?.deal_id) };
        const sessionToken = await this.auth.auth();
        return axios.post(`${sandboxUrl}/webhooks/simulate`, payload, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
