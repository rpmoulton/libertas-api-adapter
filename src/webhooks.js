import Auth from './auth.js';
import { sandboxUrl } from './config.js';
import { resourceId } from './security.js';

export default class Webhooks {
    #sandboxSimulation;

    constructor(options, auth = new Auth(options)) {
        this.environment = options.environment;
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
        this.#sandboxSimulation = options.environment !== 'production' && this.baseUrl === sandboxUrl;
    }
    
    async registerWebhook(options) {
        return this.auth.request({
            method: 'post',
            url: `${this.baseUrl}/webhooks`,
            data: options,
        });
    }
    
    async simulateWebhook(options) {
        if (!this.#sandboxSimulation || this.baseUrl !== sandboxUrl || this.auth.baseUrl !== sandboxUrl) {
            throw new Error('Webhook simulation is available only on the Libertas sandbox in sandbox mode');
        }
        const payload = { ...options, deal_id: resourceId(options?.deal_id) };
        return this.auth.request({
            method: 'post',
            url: `${sandboxUrl}/webhooks/simulate`,
            data: payload,
        });
    }
}
