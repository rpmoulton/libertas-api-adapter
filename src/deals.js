import { appendFormField, pathSegment } from './security.js';
import Auth from './auth.js';
import FormData from 'form-data';

export default class Deals {
    constructor(options, auth = new Auth(options)) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
    }

    async createDeal(options) {
        const formData = new FormData();
        for (const index of Object.keys(options)) {
            appendFormField(formData, index, options[index]);
        }
        return this.auth.request({
            method: 'post',
            url: `${this.baseUrl}/deals`,
            data: formData,
            headers: formData.getHeaders(),
        });
    }

    async listDeals(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/deals`,
            params: { page: options?.page, per_page: options?.per_page },
        });
    }

    async getDeal(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}`,
        });

    }
    async rejectDeal(options) {
        return this.auth.request({
            method: 'put',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/reject`,
            data: options,
        });
    }

    async getDealStatus(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/status`,
        });
    }
}
