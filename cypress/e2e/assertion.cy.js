describe('Mocking and stubbing examples', () => {
  it('mocks login + todos API with cy.intercept()', () => {
    // Fake login API response.
    // This means Cypress does not call the real backend for login.
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: {
          _id: 'u1',
          name: 'Cypress User',
          email: 'cypress@example.com',
          role: 'user',
        },
      },
    }).as('mockLogin');

    // Fake todos API response after login.
    // The app will show this mocked todo item.
    cy.intercept('GET', '**/api/todos', {
      statusCode: 200,
      body: [
        {
          _id: 't1',
          title: 'Mocked todo from intercept',
          description: 'No backend call needed',
          priority: 'high',
          completed: false,
          dueDate: '2030-01-01T00:00:00.000Z',
        },
      ],
    }).as('mockTodos');

    // Open login page.
    cy.visit('/login');

    // Fill the login form and click Login.
    cy.get('#email').type('cypress@example.com');
    cy.get('#password').type('Password123!');
    cy.contains('button', 'Login').click();

    // Wait until mocked network calls are used.
    cy.wait('@mockLogin');
    cy.wait('@mockTodos');

    // Check that dashboard and mocked data are visible.
    cy.contains('Todo Dashboard').should('be.visible');
    cy.contains('Welcome, Cypress User!').should('be.visible');
    cy.contains('Mocked todo from intercept').should('be.visible');
  });

  it('mocks a login error response', () => {
    // Fake a failed login response (401 Unauthorized).
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials (mocked)' },
    }).as('failedLogin');

    // Open login page.
    cy.visit('/login');

    // Try wrong login details.
    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('badpassword');
    cy.contains('button', 'Login').click();

    // Wait for mocked failed login and check error text.
    cy.wait('@failedLogin');
    cy.contains('Invalid credentials (mocked)').should('be.visible');
  });

  it('mocks creating a new todo with POST', () => {
    // Fake login response.
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: {
          _id: 'u1',
          name: 'Todo Creator',
          email: 'creator@example.com',
          role: 'user',
        },
      },
    }).as('mockLogin');

    // Start with empty todos list.
    cy.intercept('GET', '**/api/todos', {
      statusCode: 200,
      body: [],
    }).as('mockTodosEmpty');

    // Fake POST /api/todos response when creating a new todo.
    // This simulates the backend accepting and saving the new todo.
    cy.intercept('POST', '**/api/todos', {
      statusCode: 201,
      body: {
        todo: {
          _id: 'new-todo-123',
          title: 'Buy groceries',
          description: 'Milk, eggs, bread',
          priority: 'medium',
          completed: false,
          dueDate: '2026-03-10T00:00:00.000Z',
        },
      },
    }).as('mockCreateTodo');

    // Login first.
    cy.visit('/login');
    cy.get('#email').type('creator@example.com');
    cy.get('#password').type('Password123!');
    cy.contains('button', 'Login').click();
    cy.wait('@mockLogin');
    cy.wait('@mockTodosEmpty');

    // Verify we start with empty todos.
    cy.contains('No todos yet. Create your first task!').should('be.visible');

    // Click the + button to open create todo modal.
    cy.get('.new-task-icon-btn').click();

    // Fill out the todo creation form.
    cy.get('#title').type('Buy groceries');
    cy.get('#description').type('Milk, eggs, bread');
    cy.get('select[name="priority"]').select('medium');
    cy.get('#dueDate').type('2026-03-10');

    // Submit the form.
    cy.contains('button', 'Add Todo').click();

    // Wait for mocked POST request.
    cy.wait('@mockCreateTodo');

    // Wait for empty state message to disappear (means todo was added).
    cy.contains('No todos yet').should('not.exist');

    // Check that the new todo appears in the todo list.
    cy.contains('Buy groceries').should('be.visible');
    cy.contains('Milk, eggs, bread').should('be.visible');
  });

//   it('stubs localStorage token read with cy.stub()', () => {
//     // Fake the current user API response.
//     // This simulates a user who is already logged in.
//     cy.intercept('GET', '**/api/auth/me', {
//       statusCode: 200,
//       body: {
//         user: {
//           _id: 'u2',
//           name: 'Stubbed Session User',
//           email: 'stubbed@example.com',
//           role: 'user',
//         },
//       },
//     }).as('currentUser');

//     // Fake empty todos list.
//     cy.intercept('GET', '**/api/todos', {
//       statusCode: 200,
//       body: [],
//     }).as('todos');

//     // Open app root page.
//     // Stub localStorage.getItem('token') so app thinks token exists.
//     cy.visit('/', {
//       onBeforeLoad(win) {
//         cy.stub(win.localStorage, 'getItem')
//           .withArgs('token')
//           .returns('stubbed-token');
//       },
//     });

//     // Wait for mocked API calls and verify page text.
//     cy.wait('@currentUser');
//     cy.wait('@todos');
//     cy.contains('Welcome, Stubbed Session User!').should('be.visible');
//     cy.contains('No todos yet. Create your first task!').should('be.visible');
//   });
});