import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditTodo from './pages/EditTodo';
import './App.css';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/edit/:id" element={user ? <EditTodo /> : <Navigate to="/login" />} />
        <Route path="/" element={!user ? <Navigate to="/login" /> : <Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
