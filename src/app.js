const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const divisionRoutes = require('./routes/divisionRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const accessEventRoutes = require('./routes/accessEventRoutes');
const reportRoutes = require('./routes/reportRoutes');
const testRoutes = require('./routes/testRoutes');
const openApiSpec = require('./docs/openapi');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/docs.json', (req, res) => {
    res.status(200).json(openApiSpec);
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    explorer: true,
    customSiteTitle: 'ParkSecure Cloud API Docs'
}));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ParkSecure backend is running'
    });
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', divisionRoutes);
app.use('/api', employeeRoutes);
app.use('/api', deviceRoutes);
app.use('/api', accessEventRoutes);
app.use('/api', reportRoutes);
app.use('/api', testRoutes);

module.exports = app;
