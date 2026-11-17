#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).parse();
import libertasSDK from '../index.js';
import {
    createDealData,
    createStipData,
} from './test-data.js';

const getResult = async (argv) => {
    if (!process.env.LIBERTAS_API_KEY) throw new Error('LIBERTAS_API_KEY is required');
    const libertasClient = new libertasSDK({
        token: process.env.LIBERTAS_API_KEY,
        environment: 'sandbox',
    });
    switch (argv.endpoint) {
        case "listDeals":
            return libertasClient.listDeals();        
        case "getDeal":
            return libertasClient.getDeal({deal_id: argv.deal_id});        
        case "createDeal":
            return libertasClient.createDeal(createDealData);
        case "rejectDeal":
            return libertasClient.rejectDeal({deal_id: argv.deal_id});        
        case "getDealStatus":
            return libertasClient.getDealStatus({deal_id: argv.deal_id});        
        case "getFundedDeals":
            return libertasClient.getFundedDeals();        
        case "createStipulation":
            return libertasClient.createStipulation({deal_id: argv.deal_id, ...createStipData});        
        case "deleteStipulation":
            return libertasClient.deleteStipulation({deal_id: argv.deal_id, stipulation_id: argv.stipulation_id});        
        case "getAllStipulations":
            return libertasClient.getAllStipulations({deal_id: argv.deal_id});
        case "updateStipulation":
            return libertasClient.updateStipulation({deal_id: argv.deal_id, stipulation_id: argv.stipulation_id});
        case "getStipulationTypes": 
            return libertasClient.getStipulationTypes();
        case "registerWebhook": 
            return libertasClient.registerWebhook({type: argv.type, url: argv.url});
        case "simulateWebhook": 
            return libertasClient.simulateWebhook({deal_id: argv.deal_id, type: argv.type});
        case "getIndustries": 
            return libertasClient.getIndustries();
        case "getOffers": 
            return libertasClient.getOffers({deal_id: argv.deal_id});
        case "acceptOffer": 
            return libertasClient.acceptOffer({deal_id: argv.deal_id, offer_id: argv.offer_id});
        default:
            throw new Error('Unknown endpoint');
    }
}

try {
    if (!argv.endpoint) {
        throw new Error('endpoint required for testing.');
    }
    const result = await getResult(argv);
    console.log(result?.data);
} catch (e) {
    console.error('Request failed:', e.response?.status ?? 'no response');
    process.exitCode = 1;
}
