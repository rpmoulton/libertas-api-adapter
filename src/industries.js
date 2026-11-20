import Auth from './auth.js';

export default class Industries {
    constructor(options, auth = new Auth(options)) {
        this.environment = options.environment;
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
    }
    async getIndustries() {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/industries`,
        });
    }
}
