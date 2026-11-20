import { appendFormField, pathSegment, resourceId } from './security.js';
import Auth from './auth.js';
import FormData from 'form-data';

function stipulationForm(options) {
    const form = new FormData();
    for (const [name, value] of Object.entries(options)) {
        if (value == null) continue;
        if (name === 'file' && (Buffer.isBuffer(value) || typeof value?.pipe === 'function')) {
            if (options.file_type != null &&
                (typeof options.file_type !== 'string' || /[\r\n]/u.test(options.file_type))) {
                throw new TypeError('file_type must be a single-line MIME type');
            }
            appendFormField(form, name, value, {
                filename: options.file_name,
                contentType: options.file_type,
            });
        } else {
            appendFormField(form, name, value);
        }
    }
    return form;
}

export default class Stips {
    constructor(options, auth = new Auth(options)) {
        this.environment = options.environment;
        this.auth = auth;
        this.baseUrl = this.auth.baseUrl;
    }

    async createStipulation(options) {
        const dealId = pathSegment(options.deal_id);
        const formData = stipulationForm(options);
        return this.auth.request({
            method: 'post',
            url: `${this.baseUrl}/deals/${dealId}/stipulations`,
            data: formData,
            headers: formData.getHeaders(),
        });
    }

    async createStipulationUploadUrl(options) {
        const { deal_id, file_name, file_type, file_size, stipulation_type_id } = options;
        const url = `${this.baseUrl}/deals/${pathSegment(deal_id)}/stipulations/upload-url`;
        if (!Number.isSafeInteger(file_size) || file_size <= 0) {
            throw new TypeError('file_size must be a positive integer byte count');
        }
        if (typeof file_name !== 'string' || !file_name.trim() ||
            typeof file_type !== 'string' || !file_type.trim() || /[\r\n]/u.test(file_type)) {
            throw new TypeError('file_name and file_type are required');
        }
        const stipulationTypeId = resourceId(stipulation_type_id);
        return this.auth.request({
            method: 'post',
            url,
            data: { file_name, file_type, file_size, stipulation_type_id: stipulationTypeId },
        });
    }

    async deleteStipulation(options) {
        return this.auth.request({
            method: 'delete',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/stipulations/${pathSegment(options.stipulation_id)}`,
        });
    }

    async getAllStipulations(options) {
        return this.auth.request({
            method: 'get',
            url: `${this.baseUrl}/deals/${pathSegment(options.deal_id)}/stipulations`,
            params: { page: options.page, per_page: options.per_page },
        });
    }

    async updateStipulation(options) {
        const { deal_id, stipulation_id, ...fields } = options;
        const url = `${this.baseUrl}/deals/${pathSegment(deal_id)}/stipulations/${pathSegment(stipulation_id)}`;
        if (!Object.values(fields).some(value => value != null)) {
            throw new TypeError('A stipulation update field is required');
        }
        const formData = stipulationForm(fields);
        return this.auth.request({
            method: 'put',
            url,
            data: formData,
            headers: formData.getHeaders(),
        });
    }
}
