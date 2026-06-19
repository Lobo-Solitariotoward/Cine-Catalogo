import { describe, expect, it } from 'vitest'
import { evaluarPassword, passwordEsFuerte, validarEmail } from './validation'

describe('validarEmail', () => {
  it('acepta emails con formato valido', () => {
    expect(validarEmail('test@cinelog.com')).toBe(true)
  })

  it('rechaza emails sin arroba', () => {
    expect(validarEmail('test-cinelog')).toBe(false)
  })
})

describe('evaluarPassword', () => {
  it('retorna todas las reglas cumplidas para password fuerte', () => {
    expect(evaluarPassword('Test1234')).toEqual({
      longitud: true,
      mayuscula: true,
      numero: true,
    })
  })

  it('retorna reglas incumplidas para password debil', () => {
    const resultado = evaluarPassword('weak')
    expect(resultado.longitud).toBe(false)
    expect(resultado.mayuscula).toBe(false)
    expect(resultado.numero).toBe(false)
  })
})

describe('passwordEsFuerte', () => {
  it('retorna true para password que cumple todos los requisitos', () => {
    expect(passwordEsFuerte('Test1234')).toBe(true)
  })

  it('retorna false para password que no cumple requisitos', () => {
    expect(passwordEsFuerte('weak')).toBe(false)
  })
})
