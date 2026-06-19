import { describe, expect, it, vi, afterEach } from 'vitest'
import { tiempoRelativo } from './notificationService'

describe('tiempoRelativo', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('retorna justo ahora para fechas menores a 60 segundos', () => {
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-06-18T12:00:59').getTime())
        expect(tiempoRelativo('2026-06-18T12:00:00')).toBe('justo ahora')
    })

    it('retorna hace X min para fechas entre 1 y 59 minutos', () => {
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-06-18T12:05:00').getTime())
        expect(tiempoRelativo('2026-06-18T12:00:00')).toBe('hace 5 min')
    })

    it('retorna hace Xh para fechas entre 1 y 23 horas', () => {
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-06-18T15:00:00').getTime())
        expect(tiempoRelativo('2026-06-18T12:00:00')).toBe('hace 3h')
    })

    it('retorna ayer para fechas de 1 dia', () => {
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-06-19T12:00:01').getTime())
        expect(tiempoRelativo('2026-06-18T12:00:00')).toBe('ayer')
    })

    it('retorna hace Xd para fechas entre 2 y 6 dias', () => {
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-06-22T12:00:00').getTime())
        expect(tiempoRelativo('2026-06-18T12:00:00')).toBe('hace 4d')
    })

    it('retorna fecha formateada para fechas mayores a 7 dias', () => {
        vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-07-01T12:00:00').getTime())
        const resultado = tiempoRelativo('2026-06-18T12:00:00')
        expect(resultado).toContain('jun')
        expect(resultado).toContain('2026')
    })
})
