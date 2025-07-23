import axios from 'axios';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class Stips {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
    }

    async createStipulation(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/deals/${options.deal_id}/stipulations`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async deleteStipulation(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.delete(`${baseUrl}/deals/${options.deal_id}/stipulations/${stipulation_id}`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async getAllStipulations(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/deals/${options.deal_id}/stipulations`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async updateStipulation(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.put(`${baseUrl}/deals/${options.deal_id}/stipulations/${options.stipulation_id}`, options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
