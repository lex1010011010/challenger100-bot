import 'dotenv/config';
import Bot from './Bot';
import Worker from './Worker';

const token = '7899725360:AAGBr-mg0MxTwN19wx2dqyjy1xiR9du_j5Y';

const botInstance = new Bot(token);
botInstance.start().then(() => {
    const worker = new Worker(botInstance.getBotInstance(), botInstance.getUserRepository());
    worker.start();
}).catch((err) => console.error('Ошибка при запуске бота:', err));
