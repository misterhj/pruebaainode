//https://shiper.app/dashboard/project/cmi4ux4060002zyghgtbqgsdv
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();
//const router = require('express').Router();

dotenv.config({ path: '.env' });

const API_KEY = process.env.API_KEY;

app.use(express.json())
app.use(express.static('./public')); // Servir archivos estáticos desde el directorio 'public'
// Establecer EJS como motor de vistas 
app.set("view engine", "ejs"); 

// Establecer el directorio de vistas 

app.set("views", path.join(__dirname, "views"));

app.get("/", function (req, res) {
  res.render("index"); 
});

app.post('/api/resources', async (req, res) => {
  // Access data sent in the request body
  const newData = req.body;

  // Perform operations with the data (e.g., save to a database)
  // For demonstration, we'll just log it and send a success response
  console.log('Received new data:', newData);
  const data = await generateBotResponse(newData);
  // Send a response back to the client
  res.status(201).json(data);
});
/*
app.post("/generateBotResponse", function (req, res) {
  res.send("Generar respuesta del bot");
});
*/
app.listen(3000, function () {
  console.log("Aplicación ejemplo, escuchando el puerto 3000!");
});



const genAI = new GoogleGenerativeAI("AIzaSyA9njOCA37kibB4_tQNiakCzIGGgqCRDNw");

async function generateBotResponse(newData) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "en que año nacio Airton Senna?";
    const result = await model.generateContent(newData);
    const response = await result.response;
    //console.log(response);
    return response;
}

//main();