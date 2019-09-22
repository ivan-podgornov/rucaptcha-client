export default class RucaptchaAnswer {
    public text: string;

    constructor(text) {
        this.text = text;
    }

    static async wait(): Promise<RucaptchaAnswer> {
        return new RucaptchaAnswer('cyku');
    }
};
