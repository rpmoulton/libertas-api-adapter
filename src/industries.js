import axios from './http.js';
import Auth from './auth.js';

export default class Industries {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }
    async getIndustries() {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/industries`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}
