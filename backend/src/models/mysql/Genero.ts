import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class Genero extends Model {
    public id!: number
    public nombre!: string
    public descripcion!: string | null
}

Genero.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(255) },
}, { sequelize, tableName: 'generos', timestamps: false })

export default Genero
