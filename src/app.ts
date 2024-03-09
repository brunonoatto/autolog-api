import express from 'express';
import cors from 'cors';
import budgetRouter from './routes/budget';
import carRouter from './routes/car';
import dashboardRouter from './routes/dashboard';
import garageRouter from './routes/garage';

const app: express.Application = express();

// Port for the server
// const port: number = process.env.PORT || 3000;
const port: number = 3031;

app.use(cors());
// Middleware for JSON parsing
app.use(express.json());

// Register routes
app.use('/api/budget', budgetRouter);
app.use('/api/car', carRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/garage', garageRouter);

// Start the server
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
