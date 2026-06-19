export interface PasswordStrength {
  longitud: boolean
  mayuscula: boolean
  numero: boolean
}

export const validarEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const evaluarPassword = (password: string): PasswordStrength => ({
  longitud: password.length >= 8,
  mayuscula: /[A-Z]/.test(password),
  numero: /[0-9]/.test(password),
})

export const passwordEsFuerte = (password: string): boolean => {
  const strength = evaluarPassword(password)
  return strength.longitud && strength.mayuscula && strength.numero
}
