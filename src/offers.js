import { pathSegment } from './security.js';
import axios from './http.js';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Offers {
    constructor(options) {
        this.environment = options.environment
        this.auth = new Auth(options);
    }
    
    async getOffers(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/deals/${pathSegment(options.deal_id)}/offers`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
    async acceptOffer(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/deals/${pathSegment(options.deal_id)}/offers`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}