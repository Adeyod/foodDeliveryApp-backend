import express from 'express';
import cors from 'cors';
import dbConfig from './database/dbConfig.js';
import customerRoutes from './routes/customerRoutes.js';

dbConfig();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/customers', customerRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
