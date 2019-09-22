import assert from 'assert';
import dotenv from 'dotenv';
import finalhandler from 'finalhandler';
import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import Rucaptcha from './rucaptcha';
import RucaptchaAnswer from '../rucaptcha-answer/rucaptcha-answer';
import RucaptchaError from '../rucaptcha-error/rucaptcha-error';

dotenv.config();
const APIKEY = process.env.RUCAPTCHA_APIKEY;

describe('Rucaptcha', () => {
    describe('constructor', () => {
        it('выбрасывает TypeError если не указать apikey', () => {
            assert.throws(
                () => Rucaptcha.prototype.constructor.call(null),
                TypeError,
            );
        });

        it('выбрасывает RucaptchaError если формат apikey невалидный', () => {
            assert.throws(
                () => new Rucaptcha('invalid-apikey'),
                RucaptchaError,
            );
        });

        it('возвращает экземпляр Rucaptcha если всё хорошо', () => {
            const rucaptcha = new Rucaptcha(APIKEY);
            assert.ok(rucaptcha instanceof Rucaptcha);
        });
    });

    describe('getBalance', () => {
        it('выбрасывает RucaptchaError, если apikey невалидный', async () => {
            const INVALID_APIKEY = '12345678911234567892123456789312';
            const rucaptcha = new Rucaptcha(INVALID_APIKEY);

            await assert.rejects(
                () => rucaptcha.getBalance(),
                RucaptchaError,
            );
        });

        it('устанавливает баланс в свойство balance и возвращает его', async () => {
            const rucaptcha = new Rucaptcha(APIKEY);
            const balance = await rucaptcha.getBalance();
            assert.strictEqual('number', typeof balance);
            assert.strictEqual(balance, rucaptcha.balance);
        });
    });

    describe('solve', () => {
        let rucaptcha: null|Rucaptcha = null;
        let server: null|http.Server = null;

        before(() => {
            rucaptcha = new Rucaptcha(APIKEY);
            server = http.createServer((req, res) => {
                if (req.url === '/without-content-type') {
                    res.writeHead(200);
                    res.end();
                }

                const imagesPath = path.resolve(__dirname, './images');
                const serve = serveStatic(imagesPath);
                serve(req, res, finalhandler(req, res));
            }).listen(3000);
        });

        after(() => server.close());

        it('выбрасывает TypeError, если не указать ссылку на изображение', async () => {
            await assert.rejects(
                () => rucaptcha.solve.call(rucaptcha),
                TypeError,
            );
        });

        it('возвращает RucaptchaAnswer с правильным ответом', async () => {
            const answer = await rucaptcha.solve('http://localhost:3000/captcha.jpg');
            assert.ok(answer instanceof RucaptchaAnswer);
        });
    });
});
