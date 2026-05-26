import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

class PeliculaSerie extends Model {
    public id!: number
    public imdb_id!: string
    public titulo!: string
    public tipo!: 'pelicula' | 'serie'
    public anio!: number | null
    public calificacion_imdb!: number | null
    public poster_url!: string | null
}

PeliculaSerie.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    imdb_id: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    tipo: { type: DataTypes.ENUM('pelicula', 'serie'), allowNull: false },
    anio: { type: DataTypes.INTEGER },
    calificacion_imdb: { type: DataTypes.DECIMAL(3, 1) },
    poster_url: { type: DataTypes.STRING(500) },
}, { sequelize, tableName: 'peliculas_series', timestamps: true, createdAt: 'creado_en', updatedAt: false })

export default PeliculaSerie
