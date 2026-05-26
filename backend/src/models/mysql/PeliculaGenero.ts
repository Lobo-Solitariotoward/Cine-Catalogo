import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class PeliculaGenero extends Model {
    public pelicula_id!: number
    public genero_id!: number
}

PeliculaGenero.init({
    pelicula_id: { type: DataTypes.INTEGER, allowNull: false },
    genero_id: { type: DataTypes.INTEGER, allowNull: false },
}, { sequelize, tableName: 'pelicula_genero', timestamps: false })

export default PeliculaGenero
