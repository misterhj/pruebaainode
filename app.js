// app.js
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import generalRoutes from './routes/generalRoutes.js';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
dotenv.config({ path: '.env' });

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); 

app.use(express.json());
app.use(express.static('./public')); // Servir archivos estáticos desde el directorio 'public'
app.use(express.urlencoded({ extended: false }));
app.use('/', generalRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));