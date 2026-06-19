import { describe, expect, it } from 'vitest'
import { getErrorMessage, parsePositiveInt, redactSensitive } from '../src/utils/http'

describe('utils/http', () => {
    it('normaliza errores de tipo Error', () => {
        expect(getErrorMessage(new Error('fallo controlado'))).toBe('fallo controlado')
    })

    it('retorna Error desconocido para strings', () => {
        expect(getErrorMessage('boom')).toBe('Error desconocido')
    })

    it('parsea enteros positivos validos', () => {
        expect(parsePositiveInt('10', 0)).toBe(10)
    })

    it('retorna fallback para enteros negativos', () => {
        expect(parsePositiveInt('-1', 20)).toBe(20)
    })

    it('retorna fallback para undefined', () => {
        expect(parsePositiveInt(undefined, 20)).toBe(20)
    })

    it('redacta password en objetos', () => {
        expect(redactSensitive({ password: 'secret' })).toEqual({ password: '[REDACTED]' })
    })

    it('redacta token en objetos', () => {
        expect(redactSensitive({ token: 'jwt' })).toEqual({ token: '[REDACTED]' })
    })

    it('no redacta campos no sensibles', () => {
        expect(redactSensitive({ email: 'a@b.com' })).toEqual({ email: 'a@b.com' })
    })
})
