import axios from 'axios';
import { sanitizeHttpError } from './api-error.js';

// Never forward API keys, bearer tokens, or financial uploads through redirects.
const http = axios.create({ maxRedirects: 0, timeout: 30000 });

export async function request(config) {
    try {
        return await http.request(config);
    } catch (error) {
        throw sanitizeHttpError(error);
    }
}

export default http;
