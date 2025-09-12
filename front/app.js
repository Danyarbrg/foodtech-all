console.log('Node.js development environment is ready!');
console.log('Node.js version:', process.version);
console.log('npm version:', process.env.npm_version);

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', indexRoutes);
app.use('/users', userRoutes);

app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Страница не найдена',
        message: 'Запрашиваемая страница не существует',
        error: { status: 404 }
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const isDev = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).render('error', {
        title: 'Произошла ошибка',
        message: err.message,
        error: isDev ? err : { status: err.status || 500 }
    });
});

app.listen(PORT, () => {
    console.log(`Frontend сервер запущен на порту ${PORT}`);
    console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
