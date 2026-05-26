import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class Historial extends Model {
    public id!: number
    public usuario_id!: number
    public pelicula_id!: number
    public plataforma!: string | null
}

Historial.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    pelicula_id: { type: DataTypes.INTEGER, allowNull: false },
    plataforma: { type: DataTypes.STRING(80) },
}, { sequelize, tableName: 'historial_visto', timestamps: true, createdAt: 'visto_en', updatedAt: false })

export default Historial
