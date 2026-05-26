import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class Notificacion extends Model {
    public id!: number
    public usuario_id!: number
    public tipo!: string
    public mensaje!: string
    public leida!: boolean
}

Notificacion.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.ENUM('nueva_resena', 'like', 'recomendacion', 'sistema'), defaultValue: 'sistema' },
    mensaje: { type: DataTypes.STRING(300), allowNull: false },
    leida: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'notificaciones', timestamps: true, createdAt: 'creado_en', updatedAt: false })

export default Notificacion
