// cypress/support/e2e.ts
import './commands'

// Configuración global para todos los tests de Cypress

// Helpers para las pruebas
export const seedSession = (sessionData = { id: 1, nombre: 'QA User', email: 'qa@cinelog.test', avatar: '', rol: 'user' }) => {
  cy.window().then((win) => {
    win.localStorage.setItem('cinelog_sesion', JSON.stringify(sessionData))
    win.localStorage.setItem('cinelog_token', 'token-e2e')
  })
}

export const seedAdminSession = () => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      'cinelog_sesion',
      JSON.stringify({ id: 2, nombre: 'Admin User', email: 'admin@cinelog.test', avatar: '', rol: 'admin' })
    )
    win.localStorage.setItem('cinelog_token', 'token-admin-e2e')
  })
}
