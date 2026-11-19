import { pathSegment } from './security.js';
import axios from './http.js';
import Auth from './auth.js';

export default class Offers {
    constructor(options) {
        this.environment = options.environment
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }
    
    async getOffers(options) {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/offers`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
    async acceptOffer(options) {
        const sessionToken = await this.auth.auth();
        return axios.post(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/offers`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}