/// <reference types="cypress" />

it("Google Search", () => {
  cy.visit("https://www.google.com");
  cy.get('[name="q"]', { timeout: 10000 }).type("Aenuka Buddhakorala {Enter}");

  cy.contains('Images').click();
  
  cy.wait(2000); // Wait for 2 seconds to allow the images to load
//   cy.contains('Google Search').click();
});