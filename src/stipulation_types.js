import Auth from './auth.js';

export default class StipTypes {
    constructor(options, auth = new Auth(options)) {
        this.environment = options.environment;
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
    }

    async getStipulationTypes(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/stipulation_types`,
        });
    }
}

