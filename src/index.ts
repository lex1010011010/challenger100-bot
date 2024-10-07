import 'reflect-metadata';
import Bot from './Bot';

const token = '7899725360:AAGBr-mg0MxTwN19wx2dqyjy1xiR9du_j5Y';
const bot = new Bot(token);
bot.start().catch((err) => console.error('Ошибка при запуске бота:', err));
