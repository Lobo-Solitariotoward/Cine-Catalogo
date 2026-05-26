import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class Usuario extends Model {
    public id!: number
    public nombre!: string
    public email!: string
    public password_hash!: string
    public avatar_url!: string | null
}

Usuario.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    avatar_url: { type: DataTypes.STRING(500), defaultValue: null },
}, { sequelize, tableName: 'usuarios', timestamps: true, createdAt: 'creado_en', updatedAt: false })

export default Usuario
