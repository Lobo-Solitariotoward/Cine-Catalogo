import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../config/mysql'

// Tabla #10 MySQL / #12 total
// Calificaciones independientes (sin reseña de texto)
class Calificacion extends Model {
    public id!: number
    public usuario_id!: number
    public pelicula_id!: number
    public puntuacion!: number  // 1-10
}

Calificacion.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    pelicula_id: { type: DataTypes.INTEGER, allowNull: false },
    puntuacion: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 10 }
    },
}, {
    sequelize,
    tableName: 'calificaciones',
    timestamps: true,
    createdAt: 'calificado_en',
    updatedAt: false,
    indexes: [{ unique: true, fields: ['usuario_id', 'pelicula_id'] }]
})

export default Calificacion
