import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class Recomendacion extends Model {
    public id!: number
    public de_usuario_id!: number
    public para_usuario_id!: number
    public pelicula_id!: number
    public mensaje!: string | null
}

Recomendacion.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    de_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    para_usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    pelicula_id: { type: DataTypes.INTEGER, allowNull: false },
    mensaje: { type: DataTypes.STRING(300) },
}, { sequelize, tableName: 'recomendaciones', timestamps: true, createdAt: 'enviado_en', updatedAt: false })

export default Recomendacion
