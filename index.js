import {
    Auth,
    Deals,
    Funded,
    Industries,
    Offers,
    Stips,
    StipTypes,
    Webhooks,
} from './src/index.js';

export default class LibertasClient {
    constructor(options) {
        this.masterToken = options.token;
        this.environment = options.environment;
        this.deals = new Deals(options);
        this.offers = new Offers(options);
        this.stips = new Stips(options);
        this.industries = new Industries(options);
        this.webhooks = new Webhooks(options);
        this.auth = new Auth(options);
        this.funded = new Funded(options);
        this.stipTypes = new StipTypes(options);
    }

    async createDeal(options) {
        return await this.deals.createDeal(options);
    }

    async listDeals(options) {
        return await this.deals.listDeals(options);
    }

    async getDeal(options) {
        return await this.deals.getDeal(options);
    }

    async rejectDeal(options) {
        return await this.deals.rejectDeal(options);
    }

    async getDealStatus(options) {
        return await this.deals.getDealStatus(options);
    }

    async getFundedDeals(options) {
        return await this.funded.getFundedDeals(options);
    }

    async getIndustries(options) {
        return await this.industries.getIndustries(options);
    }

    async getOffers(options) {
        return await this.offers.getOffers(options);
    }

    async acceptOffer(options) {
        return await this.offers.acceptOfferoptions(options);
    }

    async getStipulationTypes(options) {
        return await this.stipTypes.getStipulationTypes(options);
    }

    async createStipulation(options) {
        return await this.stips.createStipulation(options);
    }

    async deleteStipulation(options) {
        return await this.stips.deleteStipulation(options);
    }

    async getAllStipulations(options) {
        return await this.stips.getAllStipulations(options);
    }

    async updateStipulation(options) {
        return await this.stips.updateStipulation(options);
    }

    async registerWebhook(options) {
        return await this.webhooks.registerWebhook(options);
    }

    async simulateWebhook(options) {
        return await this.webhooks.simulateWebhook(options);
    }
};