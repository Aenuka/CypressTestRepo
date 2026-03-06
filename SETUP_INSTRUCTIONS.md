# MERN Todo App Setup Instructions

## Project Overview
This is a full-stack MERN (MongoDB, Express, React, Node.js) todo application with:
- User authentication using JWT
- Role-based access control (User, Admin)
- CRUD operations for todos
- Priority levels (low, medium, high)
- Due dates for tasks
- Responsive UI

---

## Prerequisites
- Node.js (v14+) and npm
- MongoDB (local or Atlas)
- Git

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Configure Environment Variables
Edit `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app?retryWrites=true&w=majority
```

### 5. Start Backend Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend should run on `http://localhost:5000`

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
```

### 4. Configure Environment Variables
Edit `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 5. Start Frontend Server
```bash
npm start
```

Frontend should open on `http://localhost:3000`

---

## API Endpoints

### Authentication Endpoints
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user (Protected)

### Todo Endpoints (All Protected with JWT)
- **GET** `/api/todos` - Get all todos for current user
- **GET** `/api/todos/:id` - Get single todo
- **POST** `/api/todos` - Create new todo
- **PUT** `/api/todos/:id` - Update todo
- **DELETE** `/api/todos/:id` - Delete todo
- **GET** `/api/todos/admin/all` - Get all todos (Admin only)

---

## Authentication Flow

### 1. Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes JWT token to use in Authorization header.

### 3. Use Token
```bash
Authorization: Bearer <your_jwt_token>
```

---

## Project Structure

```
CypressTestRepo/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Todo.js               # Todo schema
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── authorize.js          # Role-based access
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   └── todos.js              # Todo routes
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── todoController.js     # Todo CRUD logic
│   ├── server.js                 # Express server
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── TodoForm.js       # Add todo form
    │   │   └── TodoList.js       # Display todos
    │   ├── pages/
    │   │   ├── Login.js          # Login page
    │   │   ├── Register.js       # Register page
    │   │   └── Dashboard.js      # Main dashboard
    │   ├── context/
    │   │   └── AuthContext.js    # Auth state management
    │   ├── services/
    │   │   └── api.js            # API calls
    │   ├── App.js                # Main App component
    │   ├── App.css               # Styles
    │   └── index.js              # Entry point
    ├── package.json
    ├── .env.example
    └── .gitignore
```

---

## Features

### User Features
- ✅ User registration and login
- ✅ Create, read, update, delete todos
- ✅ Set priority (low, medium, high)
- ✅ Set due dates
- ✅ Mark todos as completed
- ✅ View only personal todos

### Admin Features
- ✅ View all todos from all users
- ✅ Access `/api/todos/admin/all` endpoint

---

## Role-Based Access Control

### User Role
- Create and manage own todos
- Cannot access other users' todos
- Cannot access admin endpoints

### Admin Role
- Can view all todos
- Has access to admin endpoints
- Register manually or update role in MongoDB

---

## Database Models

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Todo Schema
```javascript
{
  title: String (required),
  description: String,
  completed: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  dueDate: Date,
  user: ObjectId (reference to User),
  createdBy: String (email of creator),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the Application

### 1. Register New User
- Go to http://localhost:3000/register
- Fill in name, email, and password
- Click Register

### 2. Login
- Go to http://localhost:3000/login
- Enter email and password
- Click Login

### 3. Create Todo
- Click "Add New Todo"
- Fill in title, description, priority, due date
- Click "Add Todo"

### 4. Manage Todos
- Mark as completed with the checkmark button
- Delete with Delete button
- Update by editing in database directly

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas and update MONGO_URI
- Check connection string format

### CORS Error
- Backend CORS is configured to accept requests
- Ensure frontend URL matches allowed origins
- Check backend `.env` NODE_ENV setting

### JWT Token Issues
- Token stored in localStorage
- Check JWT_SECRET matches between backend and frontend
- Token expires in 7 days by default

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Kill process or use different port

---

## Security Considerations

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Validate all inputs** on backend
4. **Store sensitive data** in environment variables
5. **Use MongoDB Atlas** with IP whitelist
6. **Implement rate limiting**
7. **Add request validation** middleware
8. **Use CSRF protection** for state-changing operations

---

## Future Enhancements

- [ ] Email verification
- [ ] Password reset
- [ ] Todo categories/tags
- [ ] Shared todos/collaboration
- [ ] Todo attachments
- [ ] Notifications
- [ ] Search and filter
- [ ] Dark mode
- [ ] Mobile app
- [ ] Todo analytics

---

## License
ISC

---

## Support
For issues and questions, please create an issue in the repository.
