describe('ToDo App - End-to-End Test Suite', () => {
  // Load fixture data
  let userCredentials;
  let taskData;

  before(() => {
    cy.fixture('task.json').then((data) => {
      taskData = data;
    });

    // Create a unique user once so login-dependent tests don't rely on pre-seeded DB state.
    cy.fixture('user.json').then((data) => {
      userCredentials = {
        ...data,
        email: `cypress_${Date.now()}@example.com`,
      };

      cy.visit('http://localhost:3000/register');
      cy.get('input[type="text"]').type('Cypress E2E User');
      cy.get('input[type="email"]').type(userCredentials.email);
      cy.get('input[type="password"]').type(userCredentials.password);
      cy.contains('button', 'Register').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });
  });

  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    // Visit the app
    cy.visit('http://localhost:3000');
  });

  const openCreateTodoModal = () => {
    cy.get('.new-task-icon-btn').click();
    cy.contains('h3', 'Create New Todo').should('be.visible');
  };

  describe('User Authentication', () => {
    it('should navigate to login page on initial visit', () => {
      cy.url().should('include', '/login');
      cy.get('h2').should('contain', 'Login');
    });

    it('should display login form with email and password fields', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Login with Fixture Data', () => {
    it('should successfully log in with valid credentials from fixture', () => {
      // Enter email and password from fixture
      cy.get('input[name="email"]').type(userCredentials.email);
      cy.get('input[name="password"]').type(userCredentials.password);

      // Submit the form
      cy.get('button[type="submit"]').click();

      // Assertions - after successful login
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
      cy.get('h1, h2, h3')
        .should('exist')
        .then(($headings) => {
          expect($headings.text()).to.include('Dashboard', 'Your Todos', 'Create New Todo');
        });

      // Verify token is stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.exist;
      });
    });

    it('should display error on login page after failed attempt', () => {
      // Enter wrong credentials
      cy.get('input[name="email"]').type(userCredentials.email);
      cy.get('input[name="password"]').type('wrongpassword');

      cy.get('button[type="submit"]').click();

      // Should remain on login page or show error
      cy.get('.error-message, [class*="error"]', { timeout: 5000 })
        .should('be.visible')
        .invoke('text')
        .should('match', /Invalid credentials|Login failed/i);
    });
  });

  describe('ToDo CRUD Operations', () => {
    beforeEach(() => {
      // Login before each test in this suite
      cy.get('input[name="email"]').type(userCredentials.email);
      cy.get('input[name="password"]').type(userCredentials.password);
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    describe('Create ToDo', () => {
      it('should add a new todo task from fixture data', () => {
        openCreateTodoModal();

        // Fill in the form with fixture data
        cy.get('input[name="title"]').type(taskData.title);
        cy.get('textarea[name="description"]').type(taskData.description);
        cy.get('select[name="priority"]').select(taskData.priority);
        cy.get('input[name="dueDate"]').type(taskData.dueDate);

        // Submit the form
        cy.get('.todo-form button[type="submit"]').click();

        // Assertions - verify the task appears in the list
        cy.contains('.todo-title', taskData.title, { timeout: 5000 }).should('be.visible');
        cy.contains('.todo-description', taskData.description).should('be.visible');
        cy.contains('.priority', taskData.priority).should('be.visible');
      });

      it('should display validation error when title is empty', () => {
        openCreateTodoModal();

        // Leave title empty and fill other fields
        cy.get('textarea[name="description"]').type('Description without title');
        cy.get('select[name="priority"]').select('medium');

        // Submit the form
        cy.get('.todo-form button[type="submit"]').click();

        // Check for error message
        cy.contains('.error-message, [class*="error"]', 'Title is required', { timeout: 5000 }).should(
          'be.visible'
        );
      });

      it('should clear form after successfully adding a todo', () => {
        openCreateTodoModal();

        // Add a todo
        cy.get('input[name="title"]').type(taskData.title);
        cy.get('textarea[name="description"]').type(taskData.description);
        cy.get('input[name="dueDate"]').type(taskData.dueDate);
        cy.get('.todo-form button[type="submit"]').click();

        // Wait for the task to appear and modal to close
        cy.contains('.todo-title', taskData.title, { timeout: 5000 }).should('be.visible');
        cy.contains('h3', 'Create New Todo').should('not.exist');

        // Re-open modal and verify form starts empty
        openCreateTodoModal();
        cy.get('input[name="title"]').should('have.value', '');
        cy.get('textarea[name="description"]').should('have.value', '');
      });
    });

    describe('Complete ToDo', () => {
      it('should mark a todo task as complete', () => {
        const todoTitle = `${taskData.title} complete ${Date.now()}`;

        // First, add a todo
        openCreateTodoModal();
        cy.get('input[name="title"]').type(todoTitle);
        cy.get('textarea[name="description"]').type(taskData.description);
        cy.get('.todo-form button[type="submit"]').click();

        // Wait for the task to appear
        cy.contains('.todo-title', todoTitle, { timeout: 5000 }).should('be.visible');

        // Check the checkbox to mark complete
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .find('.todo-checkbox input[type="checkbox"]')
          .check({ force: true });

        // Assertion - verify the todo item has completed class
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .should('have.class', 'completed');

        // Verify checkbox is checked
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .find('.todo-checkbox input[type="checkbox"]')
          .should('be.checked');
      });

      it('should uncheck a completed todo task', () => {
        const todoTitle = `${taskData.title} uncheck ${Date.now()}`;

        // Add and complete a todo
        openCreateTodoModal();
        cy.get('input[name="title"]').type(todoTitle);
        cy.get('.todo-form button[type="submit"]').click();
        cy.contains('.todo-title', todoTitle, { timeout: 5000 }).should('be.visible');
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .find('.todo-checkbox input[type="checkbox"]')
          .check({ force: true });

        // Uncheck the checkbox
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .find('.todo-checkbox input[type="checkbox"]')
          .uncheck({ force: true });

        // Assertion - verify the todo item no longer has completed class
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .should('not.have.class', 'completed');
      });
    });

    describe('Delete ToDo', () => {
      it('should delete a todo task', () => {
        const todoTitle = `${taskData.title} delete ${Date.now()}`;

        // Add a todo
        openCreateTodoModal();
        cy.get('input[name="title"]').type(todoTitle);
        cy.get('textarea[name="description"]').type(taskData.description);
        cy.get('.todo-form button[type="submit"]').click();

        // Wait for the task to appear
        cy.contains('.todo-title', todoTitle, { timeout: 5000 }).should('be.visible');

        // Get the parent todo-item to find the delete button
        cy.get('.todo-item')
          .contains(todoTitle)
          .closest('.todo-item')
          .find('.btn-delete')
          .click();

        // Assertion - verify the todo is removed from the list
        cy.contains('.todo-title', todoTitle, { timeout: 5000 }).should('not.exist');
      });

      it('should have only one todo after deleting other todos', () => {
        const firstTask = {
          title: 'First Task',
          description: 'This is the first task',
        };
        const secondTask = {
          title: 'Second Task',
          description: 'This is the second task',
        };

        // Add first todo
        openCreateTodoModal();
        cy.get('input[name="title"]').type(firstTask.title);
        cy.get('textarea[name="description"]').type(firstTask.description);
        cy.get('.todo-form button[type="submit"]').click();
        cy.contains('.todo-title', firstTask.title, { timeout: 5000 }).should('be.visible');

        // Add second todo
        openCreateTodoModal();
        cy.get('input[name="title"]').type(secondTask.title);
        cy.get('textarea[name="description"]').type(secondTask.description);
        cy.get('.todo-form button[type="submit"]').click();
        cy.contains('.todo-title', secondTask.title, { timeout: 5000 }).should('be.visible');

        // Delete first todo
        cy.get('.todo-item')
          .contains(firstTask.title)
          .closest('.todo-item')
          .find('.btn-delete')
          .click();

        // Assertion - verify first task is gone
        cy.contains('.todo-title', firstTask.title).should('not.exist');

        // Assertion - verify second task still exists
        cy.contains('.todo-title', secondTask.title).should('be.visible');
      });
    });
  });

  describe('Complete Todo Workflow', () => {
    it('should complete full workflow: login -> create -> complete -> delete', () => {
      const todoTitle = `${taskData.title} workflow ${Date.now()}`;

      // Step 1: Login with fixture data
      cy.get('input[name="email"]').type(userCredentials.email);
      cy.get('input[name="password"]').type(userCredentials.password);
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');

      // Assertion: Login successful
      cy.contains('h1', 'Todo Dashboard').should('be.visible');

      // Step 2: Add a new todo from fixture data
      openCreateTodoModal();
      cy.get('input[name="title"]').type(todoTitle);
      cy.get('textarea[name="description"]').type(taskData.description);
      cy.get('select[name="priority"]').select(taskData.priority);
      cy.get('input[name="dueDate"]').type(taskData.dueDate);
      cy.get('.todo-form button[type="submit"]').click();

      // Assertion: Task created
      cy.contains('.todo-title', todoTitle, { timeout: 5000 }).should('be.visible');
      cy.contains('.todo-description', taskData.description).should('be.visible');
      cy.contains('.priority', taskData.priority).should('be.visible');

      // Step 3: Mark the task as complete
      cy.get('.todo-item')
        .contains(todoTitle)
        .closest('.todo-item')
        .find('.todo-checkbox input[type="checkbox"]')
        .check({ force: true });

      // Assertion: Task marked complete
      cy.get('.todo-item')
        .contains(todoTitle)
        .closest('.todo-item')
        .should('have.class', 'completed');

      // Step 4: Delete the task
      cy.get('.todo-item')
        .contains(todoTitle)
        .closest('.todo-item')
        .find('.btn-delete')
        .click();

      // Assertion: Task deleted
      cy.contains('.todo-title', todoTitle).should('not.exist');
    });
  });
});
