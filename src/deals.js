import axios from 'axios';
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
        let query='?'
        if (options?.page) {
            query += `page=${options.page}`;
        }
        if (options?.per_page) {
            query += `per_page=${options.per_page}`;
        }
        const result = await axios.get(`${baseUrl}/deals${query}`, {
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
        return axios.get(`${baseUrl}/deals/${options.deal_id}`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });

    }
    async rejectDeal(options) {
        let baseUrl = sandboxUrl;
        if (options.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.put(`${baseUrl}/deals/${options.deal_id}/reject`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async getDealStatus(options) {
        let baseUrl = sandboxUrl;
        if (options.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/deals/${options.deal_id}/status`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
