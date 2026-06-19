/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      getByTestId(testId: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})
