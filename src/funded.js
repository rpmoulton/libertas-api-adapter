import axios from './http.js';
import Auth from './auth.js';

export default class Funded {
    constructor(options) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }

    async getFundedDeals(options) {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/funded`, {
            params: { page: options?.page, per_page: options?.per_page },
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
