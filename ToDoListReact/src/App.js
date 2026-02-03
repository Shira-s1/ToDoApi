import React, { useEffect, useState } from 'react';
import service from './service.js';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

function TodoApp() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  async function getTodos() {
    try {
      const todos = await service.getTasks();
      setTodos(todos);
    } catch (error) {
      // Interceptor handles redirects
    }
  }

  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return; // מניעת הוספת משימה ריקה
    await service.addTask(newTodo);
    setNewTodo("");
    await getTodos();
  }

  async function updateCompleted(todo, isComplete) {
    // שים לב: אנחנו משתמשים ב-idItems וב-name (כפי שהם מגיעים מה-API)
    // ושולחים את שלושת הפרמטרים ש-service.js מצפה להם
    await service.setCompleted(todo.idItems, todo.name, isComplete);
    await getTodos();
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        {/* Added zIndex to ensure button is clickable over other elements */}
        <div style={{ position: 'absolute', top: '-40px', right: '0', zIndex: 1000 }}>
            <button 
                onClick={handleLogout} 
                style={{ 
                    cursor: 'pointer', 
                    background: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '4px', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#c0392b'}
                onMouseOut={(e) => e.target.style.background = '#e74c3c'}
            >
                Logout
            </button>
        </div>
        <form onSubmit={createTodo}>
          <input 
            className="new-todo" 
            placeholder="Well, let's take on the day" 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
          />
        </form>
      </header>
      <section className="main" style={{ display: "block" }}>
        <ul className="todo-list">
          {todos.map(todo => {
            return (
              /* שימוש ב-idItems כי זה השם שמגיע מה-DB */
              <li className={todo.isComplete ? "completed" : ""} key={todo.idItems}>
                <div className="view">
                  <input 
                    className="toggle" 
                    type="checkbox" 
                    checked={todo.isComplete} // עדיף checked על defaultChecked כשעובדים עם state
                    onChange={(e) => updateCompleted(todo, e.target.checked)} 
                  />
                  <label>{todo.name}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.idItems)}></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section >
  );
}

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
      <Router>
          <Routes>
              <Route path="/" element={
                  <PrivateRoute>
                      <TodoApp />
                  </PrivateRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </Router>
    );
  }

export default App;