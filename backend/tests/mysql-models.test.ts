import { describe, expect, it } from 'vitest'
import Usuario from '../src/models/mysql/Usuario'
import PeliculaSerie from '../src/models/mysql/PeliculaSerie'
import Resena from '../src/models/mysql/Resena'
import ListaUsuario from '../src/models/mysql/ListaUsuario'
import Calificacion from '../src/models/mysql/Calificacion'
import Historial from '../src/models/mysql/Historial'
import Genero from '../src/models/mysql/Genero'
import Notificacion from '../src/models/mysql/Notificacion'

describe('Usuario - MySQL Model', () => {
    it('define constraints NOT NULL y UNIQUE requeridos', () => {
        const attrs = Usuario.getAttributes()
        expect(attrs.nombre.allowNull).toBe(false)
        expect(attrs.email.allowNull).toBe(false)
        expect(attrs.email.unique).toBe(true)
        expect(attrs.password_hash.allowNull).toBe(false)
    })

    it('tiene campo rol con default user', () => {
        const attrs = Usuario.getAttributes()
        expect(attrs.rol).toBeDefined()
        expect(attrs.rol.defaultValue).toBe('user')
    })

    it('construye instancia con campos obligatorios', () => {
        const user = Usuario.build({
            nombre: 'Test User',
            email: 'test@test.com',
            password_hash: 'hash123',
        })
        expect(user.get('nombre')).toBe('Test User')
        expect(user.get('email')).toBe('test@test.com')
    })
})

describe('PeliculaSerie - MySQL Model', () => {
    it('define UNIQUE en imdb_id', () => {
        const attrs = PeliculaSerie.getAttributes()
        expect(attrs.imdb_id.unique).toBe(true)
    })

    it('define constraints NOT NULL en campos criticos', () => {
        const attrs = PeliculaSerie.getAttributes()
        expect(attrs.titulo.allowNull).toBe(false)
        expect(attrs.tipo.allowNull).toBe(false)
    })

    it('construye instancia correctamente', () => {
        const pelicula = PeliculaSerie.build({
            imdb_id: 'tt1375666',
            titulo: 'Inception',
            tipo: 'pelicula',
            anio: 2010,
            calificacion_imdb: 8.8,
        })
        expect(pelicula.get('titulo')).toBe('Inception')
        expect(pelicula.get('tipo')).toBe('pelicula')
    })
})

describe('Resena - MySQL Model', () => {
    it('define campos requeridos', () => {
        const attrs = Resena.getAttributes()
        expect(attrs.usuario_id.allowNull).toBe(false)
        expect(attrs.pelicula_id.allowNull).toBe(false)
        expect(attrs.texto.allowNull).toBe(false)
    })

    it('tiene default para calificacion y likes', () => {
        const attrs = Resena.getAttributes()
        expect(attrs.calificacion.defaultValue).toBe(5)
        expect(attrs.likes.defaultValue).toBe(0)
    })
})

describe('ListaUsuario - MySQL Model', () => {
    it('define campos requeridos', () => {
        const attrs = ListaUsuario.getAttributes()
        expect(attrs.usuario_id.allowNull).toBe(false)
        expect(attrs.pelicula_id.allowNull).toBe(false)
    })

    it('tiene default para estado', () => {
        const attrs = ListaUsuario.getAttributes()
        expect(attrs.estado.defaultValue).toBe('por_ver')
    })
})

describe('Calificacion - MySQL Model', () => {
    it('define campos requeridos', () => {
        const attrs = Calificacion.getAttributes()
        expect(attrs.usuario_id.allowNull).toBe(false)
        expect(attrs.pelicula_id.allowNull).toBe(false)
        expect(attrs.puntuacion.allowNull).toBe(false)
    })
})

describe('Historial - MySQL Model', () => {
    it('define campos requeridos', () => {
        const attrs = Historial.getAttributes()
        expect(attrs.usuario_id.allowNull).toBe(false)
        expect(attrs.pelicula_id.allowNull).toBe(false)
    })

    it('plataforma es string y no requerido', () => {
        const attrs = Historial.getAttributes()
        expect(attrs.plataforma.type.key).toBe('STRING')
    })
})

describe('Genero - MySQL Model', () => {
    it('define nombre como requerido', () => {
        const attrs = Genero.getAttributes()
        expect(attrs.nombre.allowNull).toBe(false)
        expect(attrs.nombre.unique).toBe(true)
    })
})

describe('Notificacion - MySQL Model', () => {
    it('define campos requeridos', () => {
        const attrs = Notificacion.getAttributes()
        expect(attrs.usuario_id.allowNull).toBe(false)
        expect(attrs.mensaje.allowNull).toBe(false)
    })

    it('tiene default leida en false', () => {
        const attrs = Notificacion.getAttributes()
        expect(attrs.leida.defaultValue).toBe(false)
    })
})
