import axios from './http.js';
import Auth from './auth.js';
import {
    sandboxUrl,
    productionUrl,
} from './config.js';

export default class StipTypes {
    constructor(options) {
        this.environment = options.environment;
        this.auth = new Auth(options);
    }

    async getStipulationTypes(options) {
        let baseUrl = sandboxUrl;
        if (this.environment === 'production') {
            baseUrl = productionUrl;
        }
        const sessionToken = await this.auth.auth();
        return axios.get(`${baseUrl}/stipulation_types`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            }
        });
    }
}

