import Usuario from './Usuario'
import PeliculaSerie from './PeliculaSerie'
import ListaUsuario from './ListaUsuario'
import Resena from './Resena'
import Historial from './Historial'
import Genero from './Genero'
import PeliculaGenero from './PeliculaGenero'
import Notificacion from './Notificacion'
import Recomendacion from './Recomendacion'
import Calificacion from './Calificacion'

// Usuario → ListaUsuario
Usuario.hasMany(ListaUsuario, { foreignKey: 'usuario_id' })
ListaUsuario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' })

// PeliculaSerie → ListaUsuario
PeliculaSerie.hasMany(ListaUsuario, { foreignKey: 'pelicula_id' })
ListaUsuario.belongsTo(PeliculaSerie, { foreignKey: 'pelicula_id', as: 'pelicula' })

// Usuario → Resena
Usuario.hasMany(Resena, { foreignKey: 'usuario_id' })
Resena.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' })

// PeliculaSerie → Resena
PeliculaSerie.hasMany(Resena, { foreignKey: 'pelicula_id' })
Resena.belongsTo(PeliculaSerie, { foreignKey: 'pelicula_id', as: 'pelicula' })

// Usuario → Historial
Usuario.hasMany(Historial, { foreignKey: 'usuario_id' })
Historial.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' })

// PeliculaSerie → Historial
PeliculaSerie.hasMany(Historial, { foreignKey: 'pelicula_id' })
Historial.belongsTo(PeliculaSerie, { foreignKey: 'pelicula_id', as: 'pelicula' })

// Muchos a muchos: PeliculaSerie ↔ Genero
PeliculaSerie.belongsToMany(Genero, { through: PeliculaGenero, foreignKey: 'pelicula_id' })
Genero.belongsToMany(PeliculaSerie, { through: PeliculaGenero, foreignKey: 'genero_id' })

// Usuario → Calificacion
Usuario.hasMany(Calificacion, { foreignKey: 'usuario_id' })
Calificacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' })

// PeliculaSerie → Calificacion
PeliculaSerie.hasMany(Calificacion, { foreignKey: 'pelicula_id' })
Calificacion.belongsTo(PeliculaSerie, { foreignKey: 'pelicula_id', as: 'pelicula' })

// Usuario → Notificacion
Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id' })
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id' })

// Recomendacion
PeliculaSerie.hasMany(Recomendacion, { foreignKey: 'pelicula_id' })
Recomendacion.belongsTo(PeliculaSerie, { foreignKey: 'pelicula_id', as: 'pelicula' })

export {
    Usuario, PeliculaSerie, ListaUsuario,
    Resena, Historial, Genero, PeliculaGenero,
    Notificacion, Recomendacion, Calificacion
}
