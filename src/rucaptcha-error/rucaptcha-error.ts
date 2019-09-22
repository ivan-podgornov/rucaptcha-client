export default class RucaptchaError extends Error {
    public name: string;
    public code: string;

    constructor(code: string) {
        const messages = {};
        const message = code in messages ? messages[code] : 'Неизвестная ошибка';

        super(message);
        this.name = 'RucaptchaError';
        this.code = code;
    }
};
