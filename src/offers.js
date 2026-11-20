import { pathSegment } from './security.js';
import Auth from './auth.js';

export default class Offers {
    constructor(options, auth = new Auth(options)) {
        this.environment = options.environment
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
    }
    
    async getOffers(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/offers`,
        });
    }
    async acceptOffer(options) {
        return this.auth.request({
            method: 'post',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/offers`,
            data: options,
        });
    }
}