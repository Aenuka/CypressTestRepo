/// <reference types="cypress" />

describe('Todo App', () => {
  const testUser = {
    email: Cypress.env('email') || 'nash@gmail.com',
    password: Cypress.env('password') || '123456',
  };

  // Unique title per run so leftover todos from previous runs never collide
  const uid = () => Date.now();

  // ─── Login before every test ─────────────────────────────────────────────────
  beforeEach(() => {
    cy.intercept('POST', 'http://localhost:5000/api/todos').as('createTodo');
    cy.intercept('DELETE', 'http://localhost:5000/api/todos/*').as('deleteTodo');
    cy.intercept('PUT', 'http://localhost:5000/api/todos/*').as('updateTodo');

    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  // ─── Helper: open modal, fill form and submit ────────────────────────────────
  const createTodo = (title, description = 'Created by Cypress', priority = 'high') => {
    cy.get('.new-task-icon-btn', { timeout: 10000 }).should('be.visible').click();
    cy.get('.modal-card', { timeout: 8000 }).should('be.visible');

    cy.get('input[name="title"]').should('be.visible').clear().type(title);
    cy.get('textarea[name="description"]').clear().type(description);
    cy.get('.todo-form select[name="priority"]').select(priority);
    cy.get('.todo-form button[type="submit"]').click();

    // Wait for POST to succeed, then confirm modal closed and item in DOM
    cy.wait('@createTodo').its('response.statusCode').should('eq', 201);
    cy.get('.modal-card').should('not.exist');
    cy.contains('.todo-item', title, { timeout: 8000 }).should('be.visible');
  };

  // ─── Helper: delete by title — waits for API + DOM removal ──────────────────
  const deleteTodo = (title) => {
    cy.contains('.todo-item', title)
      .find('button.btn-delete')
      .click();

    cy.wait('@deleteTodo').its('response.statusCode').should('eq', 200);

    // Use a fresh DOM query (not an alias) to assert the item is gone
    cy.contains('.todo-item', title).should('not.exist');
  };

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 1: Add a new todo
  // ────────────────────────────────────────────────────────────────────────────
  it('should add a new todo', () => {
    const title = `Add Todo ${uid()}`;

    createTodo(title, 'Test description', 'high');

    cy.contains('.todo-item', title).within(() => {
      cy.get('.todo-title').should('have.text', title);
      cy.get('.todo-description').should('contain.text', 'Test description');
      cy.get('.priority-high').should('exist');
    });

    // 📸 Screenshot: new todo visible in the list
    cy.screenshot('01 - Add Todo - new todo added', { overwrite: true });

    deleteTodo(title);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 2: Mark a todo as completed
  // ────────────────────────────────────────────────────────────────────────────
  it('should mark a todo as completed', () => {
    const title = `Complete Todo ${uid()}`;
    createTodo(title);

    cy.contains('.todo-item', title)
      .find('input[type="checkbox"]')
      .should('not.be.checked')
      .check();

    cy.wait('@updateTodo').its('response.statusCode').should('eq', 200);

    cy.contains('.todo-item', title)
      .find('input[type="checkbox"]')
      .should('be.checked');

    cy.contains('.todo-item', title).should('have.class', 'completed');

    // 📸 Screenshot: todo is checked and marked completed
    cy.screenshot('02 - Mark Completed - todo checked', { overwrite: true });

    deleteTodo(title);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 3: Uncheck a completed todo
  // ────────────────────────────────────────────────────────────────────────────
  it('should uncheck a completed todo', () => {
    const title = `Uncheck Todo ${uid()}`;
    createTodo(title);

    // Check first
    cy.contains('.todo-item', title).find('input[type="checkbox"]').check();
    cy.wait('@updateTodo').its('response.statusCode').should('eq', 200);
    cy.contains('.todo-item', title).should('have.class', 'completed');

    // Uncheck
    cy.contains('.todo-item', title).find('input[type="checkbox"]').uncheck();
    cy.wait('@updateTodo').its('response.statusCode').should('eq', 200);

    cy.contains('.todo-item', title)
      .find('input[type="checkbox"]')
      .should('not.be.checked');
    cy.contains('.todo-item', title).should('not.have.class', 'completed');

    // 📸 Screenshot: todo is unchecked / back to active
    cy.screenshot('03 - Uncheck Todo - todo unchecked', { overwrite: true });

    deleteTodo(title);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 4: Edit a todo
  // ────────────────────────────────────────────────────────────────────────────
  it('should edit an existing todo', () => {
    const originalTitle = `Edit Original ${uid()}`;
    const updatedTitle = `Edit Updated ${uid()}`;

    createTodo(originalTitle, 'Original description', 'medium');

    // Open edit modal
    cy.contains('.todo-item', originalTitle)
      .find('button.btn-edit')
      .click();

    cy.get('.modal-card', { timeout: 8000 }).should('be.visible');
    cy.get('.modal-card').should('contain.text', 'Edit Task');

    cy.get('input[name="title"]').clear().type(updatedTitle);
    cy.get('textarea[name="description"]').clear().type('Updated description');
    cy.get('select[name="priority"]').select('low');
    cy.get('button.btn-submit').click();

    cy.wait('@updateTodo').its('response.statusCode').should('eq', 200);
    cy.get('.modal-card').should('not.exist');

    // Verify updated todo
    cy.contains('.todo-item', updatedTitle, { timeout: 8000 }).within(() => {
      cy.get('.todo-title').should('have.text', updatedTitle);
      cy.get('.priority-low').should('exist');
    });

    // Original must be gone
    cy.contains('.todo-item', originalTitle).should('not.exist');

    // 📸 Screenshot: edited todo visible with updated title
    cy.screenshot('04 - Edit Todo - todo updated', { overwrite: true });

    deleteTodo(updatedTitle);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 5: Cancel edit — todo stays unchanged
  // ────────────────────────────────────────────────────────────────────────────
  it('should cancel editing and leave todo unchanged', () => {
    const title = `Cancel Edit ${uid()}`;
    createTodo(title, 'Original description', 'medium');

    cy.contains('.todo-item', title).find('button.btn-edit').click();
    cy.get('.modal-card', { timeout: 8000 }).should('be.visible');

    cy.get('input[name="title"]').clear().type('Should Not Be Saved');

    // 📸 Screenshot: edit modal open with unsaved changes typed in
    cy.screenshot('05 - Cancel Edit - modal open with unsaved changes', { overwrite: true });

    cy.get('button.btn-cancel').click();

    cy.get('.modal-card').should('not.exist');

    // Original must still exist, unsaved title must not
    cy.contains('.todo-item', title).should('exist');
    cy.contains('.todo-item', 'Should Not Be Saved').should('not.exist');

    deleteTodo(title);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 6: Delete a todo
  // ────────────────────────────────────────────────────────────────────────────
  it('should delete a todo', () => {
    const title = `Delete Todo ${uid()}`;
    createTodo(title);

    cy.contains('.todo-item', title).should('exist');

    // 📸 Screenshot: todo exists, about to be deleted
    cy.screenshot('06 - Delete Todo - before delete', { overwrite: true });

    deleteTodo(title);

    cy.contains('.todo-item', title).should('not.exist');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 7: Full lifecycle — add → complete → edit → delete
  // ────────────────────────────────────────────────────────────────────────────
  it('should handle the full todo lifecycle: add → complete → edit → delete', () => {
    const originalTitle = `Lifecycle ${uid()}`;
    const updatedTitle = `Lifecycle Updated ${uid()}`;

    // Step 1: Add
    createTodo(originalTitle, 'Lifecycle test', 'medium');
    cy.contains('.todo-item', originalTitle).should('exist');

    // 📸 Screenshot: Step 1 — todo just added
    cy.screenshot('07a - Lifecycle - todo added', { overwrite: true });

    // Step 2: Complete
    cy.contains('.todo-item', originalTitle)
      .find('input[type="checkbox"]')
      .check();
    cy.wait('@updateTodo').its('response.statusCode').should('eq', 200);
    cy.contains('.todo-item', originalTitle).should('have.class', 'completed');

    // 📸 Screenshot: Step 2 — todo completed
    cy.screenshot('07b - Lifecycle - todo completed', { overwrite: true });

    // Step 3: Edit
    cy.contains('.todo-item', originalTitle)
      .find('button.btn-edit')
      .click();
    cy.get('.modal-card', { timeout: 8000 }).should('be.visible');
    cy.get('input[name="title"]').clear().type(updatedTitle);
    cy.get('button.btn-submit').click();
    cy.wait('@updateTodo').its('response.statusCode').should('eq', 200);

    cy.get('.modal-card').should('not.exist');
    cy.contains('.todo-item', updatedTitle, { timeout: 8000 }).should('exist');

    // 📸 Screenshot: Step 3 — todo edited with new title
    cy.screenshot('07c - Lifecycle - todo edited', { overwrite: true });

    // Step 4: Delete
    deleteTodo(updatedTitle);
    cy.contains('.todo-item', updatedTitle).should('not.exist');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 8: Close the New Task modal via the × button
  // ────────────────────────────────────────────────────────────────────────────
  it('should close the New Task modal when the close button is clicked', () => {
    cy.get('.new-task-icon-btn', { timeout: 10000 }).should('be.visible').click();
    cy.get('.modal-card', { timeout: 8000 }).should('be.visible');

    // 📸 Screenshot: modal is open
    cy.screenshot('08 - Close Modal - modal is open', { overwrite: true });

    cy.get('.modal-card .modal-close-btn').click();
    cy.get('.modal-card').should('not.exist');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST 9: Empty title shows a validation error
  // ────────────────────────────────────────────────────────────────────────────
  it('should show an error when creating a todo without a title', () => {
    cy.get('.new-task-icon-btn', { timeout: 10000 }).should('be.visible').click();
    cy.get('.modal-card', { timeout: 8000 }).should('be.visible');

    cy.get('.todo-form button[type="submit"]').click();

    cy.get('.error-message')
      .should('be.visible')
      .and('contain.text', 'Title is required');

    // 📸 Screenshot: validation error message visible
    cy.screenshot('09 - Validation Error - title required', { overwrite: true });

    cy.get('.modal-card .modal-close-btn').click();
    cy.get('.modal-card').should('not.exist');
  });
});