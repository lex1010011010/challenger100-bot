import TelegramBot from 'node-telegram-bot-api';
import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Repository } from 'typeorm';

class Bot {
    private bot: TelegramBot;
    private userRepository!: Repository<User>;

    constructor(token: string) {
        this.bot = new TelegramBot(token, { polling: true });
    }

    // Метод для подключения базы данных
    private async connectDatabase(): Promise<void> {
        await AppDataSource.initialize();
        console.log('Подключение к базе данных установлено');
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Метод для настройки обработчиков команд
    private setUpListeners(): void {
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text || '';
            const username = msg.from?.username || 'Unknown';

            if (text.startsWith('#start')) {
                await this.handleStart(chatId, username);
            } else if (text.startsWith('#done')) {
                await this.handleDone(chatId, username);
            }
        });
    }

    // Обработка команды #start
    private async handleStart(chatId: number, username: string): Promise<void> {
        let user = await this.userRepository.findOne({ where: { username } });

        if (!user) {
            user = this.userRepository.create({ username });
            await this.userRepository.save(user);
            this.bot.sendMessage(chatId, `Привет, ${username}! Ты зарегистрирован.`);
        } else {
            this.bot.sendMessage(chatId, `Привет, ${username}! Ты уже зарегистрирован.`);
        }
    }

    // Обработка команды #done
    private async handleDone(chatId: number, username: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { username } });

        if (user) {
            user.lastActive = new Date().toISOString().split('T')[0];
            await this.userRepository.save(user);
            this.bot.sendMessage(chatId, `Спасибо, ${username}! Твоя активность на сегодня обновлена.`);
        } else {
            this.bot.sendMessage(chatId, `Пожалуйста, сначала зарегистрируйся с помощью команды #start.`);
        }
    }

    // Метод для запуска бота
    public async start(): Promise<void> {
        await this.connectDatabase();
        this.setUpListeners(); // Вызываем setUpListeners после подключения к базе данных
        console.log('Бот запущен и готов к работе!');
    }
}

export default Bot;
