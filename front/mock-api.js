const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mock API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Users endpoints
app.get('/users', (req, res) => {
  res.json([
    { 
      id: 1, 
      name: 'Андрей Петров', 
      email: 'andrey@example.com',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    { 
      id: 2, 
      name: 'Мария Иванова', 
      email: 'maria@example.com',
      role: 'user',
      isActive: true,
      createdAt: '2024-02-20T14:45:00Z'
    }
  ]);
});

app.get('/users/:id', (req, res) => {
  const users = [
    { id: 1, name: 'Андрей Петров', email: 'andrey@example.com', role: 'admin' },
    { id: 2, name: 'Мария Иванова', email: 'maria@example.com', role: 'user' }
  ];
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Запуск сервера
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Mock API Server running on http://127.0.0.1:${PORT}`);
  console.log(`📋 Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`👥 Users endpoint: http://127.0.0.1:${PORT}/users`);
});
