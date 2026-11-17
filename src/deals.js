import { pathSegment } from './security.js';
import axios from './http.js';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';
import FormData from 'form-data';

export default class Deals {
    constructor(options) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.auth = new Auth(options);
    }

    async createDeal(options) {
        const formData = new FormData();
        for (const index of Object.keys(options)) {
            formData.append(index, options[index]);
        }
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/deals`, formData, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                ...formData.getHeaders(),
            }
        });
    }

    async listDeals(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        const result = await axios.get(`${baseUrl}/deals`, {
            params: { page: options?.page, per_page: options?.per_page },
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
        return result;
    }

    async getDeal(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/deals/${pathSegment(options.deal_id)}`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });

    }
    async rejectDeal(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.put(`${baseUrl}/deals/${pathSegment(options.deal_id)}/reject`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async getDealStatus(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/deals/${pathSegment(options.deal_id)}/status`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
