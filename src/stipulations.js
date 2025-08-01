import axios from 'axios';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';
import FormData from 'form-data';

export default class Stips {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
    }

    async createStipulation(options) {
        const formData = new FormData();
        for (const index of Object.keys(options)) {
            formData.append(index, options[index]);
        }
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.post(`${baseUrl}/deals/${options.deal_id}/stipulations`, formData, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                'Content-Type': 'multipart/form-data',
            }
        });
    }

    async deleteStipulation(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.delete(`${baseUrl}/deals/${options.deal_id}/stipulations/${options.stipulation_id}`, options, {
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
