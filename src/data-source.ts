// Подключаем dotenv для загрузки переменных окружения
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entities/User';

// Создаем и экспортируем объект DataSource с конфигурацией MySQL
export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
});
