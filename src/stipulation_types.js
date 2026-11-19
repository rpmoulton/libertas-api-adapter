import axios from './http.js';
import Auth from './auth.js';

export default class StipTypes {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
        this.baseUrl = this.auth.baseUrl;
    }

    async getStipulationTypes(options) {
        const sessionToken = await this.auth.auth();
        return axios.get(`${this.baseUrl}/stipulation_types`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}

