import { pathSegment } from './security.js';
import axios from './http.js';
import Auth from './auth.js';
import FormData from 'form-data';

function stipulationForm(options) {
    const form = new FormData();
    for (const [name, value] of Object.entries(options)) {
        if (name === 'file' && (Buffer.isBuffer(value) || typeof value?.pipe === 'function')) {
            form.append(name, value, {
                filename: options.file_name,
                contentType: options.file_type,
            });
        } else {
            form.append(name, value);
        }
    }
    return form;
}

export default class Stips {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }

    async createStipulation(options) {
        const formData = stipulationForm(options);
        const sessionToken = await this.auth.auth();
        return axios.post(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/stipulations`, formData, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                ...formData.getHeaders(),
            }
        });
    }

    async createStipulationUploadUrl(options) {
        const { deal_id, file_name, file_type, file_size, stipulation_type_id } = options;
        const url = `${this.baseUrl}/deals/${pathSegment(deal_id)}/stipulations/upload-url`;
        const sessionToken = await this.auth.auth();
        return axios.post(url, { file_name, file_type, file_size, stipulation_type_id }, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async deleteStipulation(options) {
        const sessionToken = await this.auth.auth();
        return axios.delete(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/stipulations/${pathSegment(options.stipulation_id)}`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async getAllStipulations(options) {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/deals/${pathSegment(options.deal_id)}/stipulations`, {
            params: { page: options.page, per_page: options.per_page },
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }

    async updateStipulation(options) {
        const url = `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/stipulations/${pathSegment(options.stipulation_id)}`;
        const formData = options.file == null ? undefined : stipulationForm(options);
        const sessionToken = await this.auth.auth();
        return axios.put(url, formData ?? options, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                ...formData?.getHeaders(),
            }
        });
    }
}
