import { pathSegment } from './security.js';
import axios from './http.js';
import Auth from './auth.js';
import FormData from 'form-data';

export default class Deals {
    constructor(options) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }

    async createDeal(options) {
        const formData = new FormData();
        for (const index of Object.keys(options)) {
            formData.append(index, options[index]);
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${this.baseUrl}/deals`, formData, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                ...formData.getHeaders(),
            }
        });
    }

    async listDeals(options) {
        const sessionToken = await this.auth.auth();
        const result = await axios.get(`${this.baseUrl}/deals`, {
            params: { page: options?.page, per_page: options?.per_page },
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
        return result;
    }

    async getDeal(options) {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });

    }
    async rejectDeal(options) {
        const sessionToken = await this.auth.auth();
        return axios.put(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/reject`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async getDealStatus(options) {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/status`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
