import TelegramBot from 'node-telegram-bot-api';
import { Repository } from 'typeorm';
import { User } from './entities/User';
import moment from 'moment';

class Worker {
    private bot: TelegramBot;
    private userRepository: Repository<User>;

    constructor(bot: TelegramBot, userRepository: Repository<User>) {
        this.bot = bot;
        this.userRepository = userRepository;
    }

    public start(): void {
        setInterval(async () => {
            const users = await this.userRepository.find();

            users.forEach(user => {
                if (user.lastActive) {
                    const lastActiveTime = moment.utc(user.lastActive);
                    const currentTime = moment.utc();
                    const inactivityDuration = currentTime.diff(lastActiveTime, 'seconds');

                    if (inactivityDuration > 40) {
                        this.notifyInactivity(user);
                    }
                }
            });
        }, 10000);
    }

    private notifyInactivity(user: User): void {
        const message = `@${user.username}, вы неактивны более 40 секунд!`;
        const chatId = process.env.GROUP_CHAT_ID;

        if (chatId) {
            this.bot.sendMessage(chatId, message);
        } else {
            console.error('GROUP_CHAT_ID не задан в переменных окружения.');
        }
    }
}

export default Worker;