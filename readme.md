# Rucaptcha Client

Клиент для сайтов https://rucaptcha.com и https://2captcha.com. Удобен в
использовании, потому что полностью базируется на промисах.

## Установка

```bash
npm install rucaptcha-client
```

## Пример использования

```javascript
import Rucaptcha from 'rucaptcha-client';

async () => {
  const rucaptcha = new Rucaptcha('YOUR_APIKEY');

  // Если хотите использовать 2captcha в качестве endpoint
  // По умолчанию будет использоваться rucaptcha.com
  rucaptcha.baseUrl = 'https://2captcha.com';

  // Если ключ API был указан неверно, выбросит RucaptchaError с кодом
  // ERROR_KEY_DOES_NOT_EXIST. Полезно вызывать этот метод сразу после
  // инициализации, чтобы убедиться, что ключ API указан верно.
  const balance = await rucaptcha.getBalance();

  const imageUrl =
    'https://raw.githubusercontent.com/ivan-podgornov/rucaptcha-client/master/src/rucaptcha/images/captcha.jpg';
  const answer = await rucaptcha.solve(imageUrl);
  console.log(answer.text); // -> cyku если работники правильно разгадали капчу
};
```

## Свойства

- `balance: number` - результат последнего getBalance или null.
- `baseUrl: string = 'https://rucaptcha.com'` - базовый URL на который нужно
делать запрос. Если Вы хотите изменить его на https://2captcha.com, после
создания объекта рукапчи, измените свойство baseUrl. См. пример выше

## Методы

- `constructor(apikey: string)` - ключ можно найти здесь: https://rucaptcha.com/setting.
- `async getBalance: Promise<number>` - возвращает баланс текущего пользователя.
- `async solve(url: string): Promise<{ text: string }>` - решает капчу с
  изображением, которое можно скачать по указанному url.
