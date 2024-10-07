import 'dotenv/config';
import Bot from './Bot';
import Worker from './Worker';

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('Ошибка: BOT_TOKEN не указан в переменных окружения.');
    process.exit(1);
}

const botInstance = new Bot(token);
botInstance.start().then(() => {
    const worker = new Worker(botInstance.getBotInstance(), botInstance.getUserRepository());
    worker.start();
}).catch((err) => console.error('Ошибка при запуске бота:', err));
