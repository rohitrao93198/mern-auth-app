import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

const allowedOrigins = ['http://localhost:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Routes
app.get('/', (req, res) => {
    res.send('Server is running');
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})