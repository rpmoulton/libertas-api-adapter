import axios from 'axios';
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
        return axios.get(`${baseUrl}/offers`, options, {
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
        return axios.post(`${baseUrl}/offers`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}