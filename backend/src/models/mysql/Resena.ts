import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class Resena extends Model {
    public id!: number
    public usuario_id!: number
    public pelicula_id!: number
    public texto!: string
    public calificacion!: number
    public likes!: number
}

Resena.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    pelicula_id: { type: DataTypes.INTEGER, allowNull: false },
    texto: { type: DataTypes.TEXT, allowNull: false },
    calificacion: { type: DataTypes.TINYINT, defaultValue: 5, comment: '1-10 estrellas' },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, tableName: 'resenas', timestamps: true, createdAt: 'creado_en', updatedAt: false })

export default Resena
