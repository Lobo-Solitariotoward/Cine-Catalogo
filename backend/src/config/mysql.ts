import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()

export const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE!,
    process.env.MYSQL_USER!,
    process.env.MYSQL_PASSWORD!,
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
    }
)

export const conectarMySQL = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅ MySQL conectado correctamente')
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error)
        process.exit(1)
    }
}
