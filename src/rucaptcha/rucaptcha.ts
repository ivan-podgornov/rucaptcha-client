import querystring from 'querystring';
import fetch from 'node-fetch';
import RucaptchaAnswer from '../rucaptcha-answer/rucaptcha-answer';
import RucaptchaError from '../rucaptcha-error/rucaptcha-error';

export default class Rucaptcha {
    public balance: number|null;
    public apikey: string;
    private baseUrl: string;

    constructor(apikey: string) {
        if (typeof apikey !== 'string') throw new TypeError('apikey must be a string');
        if (apikey.length !== 32) throw new RucaptchaError('ERROR_WRONG_USER_KEY');
        this.apikey = apikey;
        this.balance = null;
        this.baseUrl = 'https://rucaptcha.com';
    }

    async getBalance() {
        const response: string = await this.api({ action: 'getbalance' });
        this.balance = parseFloat(response);
        return this.balance;
    }

    async solve(url: string): Promise<RucaptchaAnswer> {
        const image = await this.base64(url);
        const response = await fetch(this.baseUrl + '/in.php', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
                body: image,
                json: 1,
                key: this.apikey,
                method: 'base64',
            }),
        });

        const body = await response.json();
        const captchaId = parseInt(body.request, 10);
        return this.waitAnswer(captchaId);
    }

    private async api(params) {
        const defaultParams = { key: this.apikey, json: 1 };
        const allParams = Object.assign({}, defaultParams, params);
        const query = querystring.stringify(allParams);
        const url = this.baseUrl + '/res.php?' + query;

        interface Response { status: Number; request: any };
        const response = await fetch(url);
        const body: Response = await response.json();

        if (body.status === 0) throw new RucaptchaError(body.request);
        return body.request;
    }

    private async waitAnswer(captchaId: number): Promise<RucaptchaAnswer> {
        try {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // sleep на минималках
            const text = await this.api({ id: captchaId, action: 'get' });
            return new RucaptchaAnswer(text);
        } catch (error) {
            if (error instanceof RucaptchaError && error.code === 'CAPCHA_NOT_READY') {
                return this.waitAnswer(captchaId);
            }

            throw error;
        }
    }

    private async base64(url: string): Promise<string> {
        if (typeof url !== 'string') throw new TypeError('url must be a string');

        const response = await fetch(url);
        const image = await response.buffer();
        return image.toString('base64');
    }
};
