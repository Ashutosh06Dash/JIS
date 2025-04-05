import express from "express";
import rootRouter from './routes/index.js';
import cors from "cors";
import dotenv from 'dotenv';

// Loading environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", rootRouter);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});