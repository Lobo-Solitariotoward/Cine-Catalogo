import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

export const conectarMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        console.log('✅ MongoDB conectado correctamente')
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error)
        // No se detiene el servidor — MySQL sigue funcionando
    }
}
