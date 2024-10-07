import TelegramBot from 'node-telegram-bot-api';
import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Repository } from 'typeorm';
import moment from 'moment-timezone';

class Bot {
    private bot: TelegramBot;
    private userRepository!: Repository<User>;

    constructor(token: string) {
        this.bot = new TelegramBot(token, { polling: true });
    }

    private async connectDatabase(): Promise<void> {
        await AppDataSource.initialize();
        this.userRepository = AppDataSource.getRepository(User);
        console.log('Подключение к базе данных установлено');
    }

    private setUpListeners(): void {
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text || '';
            const username = msg.from?.username || 'Unknown';
            const messageDate = msg.date;

            if (text.startsWith('#start')) {
                const timezone = text.split(' ')[1] || 'UTC';
                await this.handleStart(chatId, username, timezone);
            } else if (text.startsWith('#done')) {
                await this.handleDone(chatId, username, messageDate);
            } else if (text.startsWith('#stop')) {
                await this.handleStop(chatId, username);
            }
        });
    }

    private async handleStart(chatId: number, username: string, timezone: string): Promise<void> {
        const userTimezone = timezone || 'UTC';

        if (!moment.tz.zone(userTimezone)) {
            this.bot.sendMessage(chatId, `Неправильная временная зона. Пожалуйста, укажите корректный часовой пояс.`);
            return;
        }

        let user = await this.userRepository.findOne({ where: { username } });

        if (!user) {
            user = this.userRepository.create({ username, timezone: userTimezone });
            await this.userRepository.save(user);
            this.bot.sendMessage(chatId, `Привет, ${username}! Ты зарегистрирован с временной зоной: ${userTimezone}`);
        } else {
            this.bot.sendMessage(chatId, `Привет, ${username}! Ты уже зарегистрирован.`);
        }
    }

    private async handleDone(chatId: number, username: string, messageDate: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username } });

        if (user) {
            const messageTimeUTC = moment.unix(messageDate).utc().toDate();  // Используем toDate() для объекта Date

            console.log(`Время отправки сообщения (UTC): ${moment(messageTimeUTC).format('YYYY-MM-DD HH:mm:ss')}`);

            user.lastActive = messageTimeUTC;
            await this.userRepository.save(user);

            this.bot.sendMessage(chatId, `Спасибо, ${username}! Ваша активность сохранена с отметкой времени: ${moment(messageTimeUTC).utc().format('YYYY-MM-DD HH:mm:ss')} (UTC).`);
        } else {
            this.bot.sendMessage(chatId, `Пожалуйста, сначала зарегистрируйтесь с помощью команды #start.`);
        }
    }

    private async handleStop(chatId: number, username: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username } });

        if (user) {
            user.lastActive = null;  // Присваиваем null для обозначения отсутствия активности
            await this.userRepository.save(user);

            this.bot.sendMessage(chatId, `Вы остановили отслеживание активности, ${username}.`);
        } else {
            this.bot.sendMessage(chatId, `Пожалуйста, сначала зарегистрируйтесь с помощью команды #start.`);
        }
    }


    public async start(): Promise<void> {
        await this.connectDatabase();
        this.setUpListeners();
        console.log('Бот запущен и готов к работе!');
    }

    public getBotInstance(): TelegramBot {
        return this.bot;
    }

    public getUserRepository(): Repository<User> {
        return this.userRepository;
    }
}

export default Bot;
