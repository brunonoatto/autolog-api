import express from 'express';
import cors from 'cors';
import loginRouter from './routes/login';
import budgetRouter from './routes/budget';
import budgetItemRouter from './routes/budget-item';
import carRouter from './routes/car';
import dashboardRouter from './routes/dashboard';
import garageRouter from './routes/garage';
import authMiddleware from './core/middlewares/authMiddleware';

const app: express.Application = express();

// Port for the server
// const port: number = process.env.PORT || 3000;
const port: number = 3031;

app.use(cors());
// Middleware for JSON parsing
app.use(express.json());

// Register routes
app.use('/api/login', loginRouter);
app.use('/api/budget', authMiddleware, budgetRouter);
app.use('/api/budget-item', authMiddleware, budgetItemRouter);
app.use('/api/car', authMiddleware, carRouter);
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/garage', authMiddleware, garageRouter);

// Start the server
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
