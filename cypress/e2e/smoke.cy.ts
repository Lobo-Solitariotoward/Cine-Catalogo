// cypress/e2e/smoke.cy.ts
describe('Smoke Test', () => {
  it('can load the app', () => {
    cy.visit('/')
    cy.get('body').should('exist')
  })
})
