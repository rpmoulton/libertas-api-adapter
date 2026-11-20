import Auth from './auth.js';

export default class Funded {
    constructor(options, auth = new Auth(options)) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
    }

    async getFundedDeals(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/funded`,
            params: { page: options?.page, per_page: options?.per_page },
        });
    }
}
