import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class ListaUsuario extends Model {
    public id!: number
    public usuario_id!: number
    public pelicula_id!: number
    public estado!: 'por_ver' | 'visto' | 'favorito'
    public calificacion!: number | null
}

ListaUsuario.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    pelicula_id: { type: DataTypes.INTEGER, allowNull: false },
    estado: { type: DataTypes.ENUM('por_ver', 'visto', 'favorito'), defaultValue: 'por_ver' },
    calificacion: { type: DataTypes.TINYINT },
}, { sequelize, tableName: 'listas_usuario', timestamps: true, createdAt: 'agregado_en', updatedAt: false })

export default ListaUsuario
