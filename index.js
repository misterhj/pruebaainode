//https://shiper.app/dashboard/project/cmi4ux4060002zyghgtbqgsdv
//https://medium.com/@pvnsripati/prompt-engineering-in-action-examples-using-google-gemini-node-js-a75253f852e1
//https://www.youtube.com/watch?v=n-sx1ul2a3g
//https://github.com/RichardSteyner/my-rag-node/tree/main
//https://github.com/googleapis/js-genai // function calling
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  //password: 'your_password',
  database: 'test'
});
/*
// Example with async/await (using mysql2)
async function fetchData() {
  const [rows, fields] = await pool.promise().query('SELECT * FROM products');
  console.log(rows);
}
fetchData();
*/
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();
//const router = require('express').Router();

dotenv.config({ path: '.env' });

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({apiKey: API_KEY});

const config = {
	temperature: 1, // Default temperature
  	topP: 0.95, 
  	topK: 40, 
	maxOutputTokens: 100, // Default max tokens
	// Add other parameters like topP, topK if needed here
};

const model = 'gemini-2.0-flash';

const initialPromt = `
Eres un asistente virtual y te llamas Ali.
Saluda amablemente.
Somos una ferretería llamada Ferretería El Tornillo Feliz.
Nuestro horario de atención es de Lunes a Viernes de 8:00 AM a 6:00 PM y Sábados de 9:00 AM a 2:00 PM.
Nuestra dirección es Calle Falsa 123, Ciudad Ejemplo.
Ofrecemos una amplia gama de productos de ferretería, incluyendo herramientas eléctricas, materiales de construcción, pinturas y accesorios para el hogar.
Puedes ayudar a los clientes a encontrar productos específicos, proporcionar información sobre precios y disponibilidad, y ofrecer consejos sobre proyectos de bricolaje.
Si un cliente tiene una pregunta que no puedes responder, por favor indícale que se comunique con nuestro equipo de atención al cliente al teléfono 555-1234 o al correo electrónico
`;

const content = {
  role: "user",
  parts: [
        { 
          text: initialPromt 
        }
  ]
};

/**
 * Calls the Google Gemini API with a given prompt and optional model parameters.
 * @param {string} prompt The text prompt to send to the AI.
 * @param {object} modelParams Optional parameters for the AI model (e.g., temperature, maxOutputTokens).
 * @returns {Promise<string>} The text response from the Gemini API.
 */
async function callGeminiApi(prompt) {

  	if(prompt.contents.length == 0) {
		prompt.contents.push(content);
	}

	const contents = prompt.contents;

    try {

		const response = await ai.models.generateContent({
			model,
			config,
			contents
		});

        //const result = await model.generateContent(prompt);
        return response;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Log more details if available, like error.response.candidates
        return `Error: ${error.message}`;
    }
}



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
  //const data = await generateBotResponse(newData);
  const data = await callGeminiApi(newData);
  // Send a response back to the client
  res.status(201).json(data);
});

app.listen(3000, function () {
  console.log("Aplicación ejemplo, escuchando el puerto 3000!");
});

async function main() {
  	const ai = new GoogleGenAI({apiKey: API_KEY});
	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: 'Why is the sky blue?',
	});
	console.log(response.text);

	/*
	const tools = [
		{
		googleSearch: {
		}
		},
	];
	const config = {
		thinkingConfig: {
		thinkingLevel: 'HIGH',
		},
		tools,
	};
	const model = 'gemini-3-pro-preview';
	const contents = [
		{
		role: 'user',
		parts: [
			{
			text: `como te llamas?`,
			},
		],
		},
	];

	const response = await ai.models.generateContentStream({
		model,
		config,
		contents,
	});
	let fileIndex = 0;
	for await (const chunk of response) {
		console.log(chunk.text);
	}
	*/
}