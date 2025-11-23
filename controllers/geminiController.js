import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises'; // For promise-based methods
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
dotenv.config({ path: '.env' });
const initialPromt = await readFile( path.join(__dirname, '../prompt.txt'), 'utf8');

const content = {
  role: "user",
  parts: [
        { 
          text: initialPromt 
        }
  ]
};

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({apiKey: API_KEY});

async function searchProducts(productName, category) {
// Example: Connect to a database and query for products
// Replace with your actual database interaction logic
    const products = [
        { id: 1, name: "Laptop Pro", category: "Electronics", price: 1200 },
        { id: 2, name: "Wireless Mouse", category: "Electronics", price: 25 },
        { id: 3, name: "Ergonomic Keyboard", category: "Accessories", price: 75 },
    ];

    let results = products;
    if (productName) {
        results = results.filter(p => p.name.toLowerCase().includes(productName.toLowerCase()));
    }

    if (category) {
        results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return results;
}

const searchProductsDeclaration = {
    name: "searchProducts",
    description: "Searches for products in the database based on name and category.",
    parameters: {
    type: "object",
    properties: {
        productName: {
        type: "string",
        description: "The name or part of the name of the product to search for.",
        },
        category: {
        type: "string",
        description: "The category of the product to search for (e.g., 'Electronics', 'Accessories').",
        },
    },
    required: [], // productName and category are optional in this example
    },
};

const config = {
    temperature: 1, // Default temperature
    topP: 0.95, 
    topK: 40, 
    maxOutputTokens: 100, // Default max tokens
    tools: [{
      functionDeclarations: [searchProductsDeclaration]
    }],
};

const model = 'gemini-2.0-flash';

const callGeminiApi = async (prompt) => {

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
        console.log('-------------------------------');
        console.log(response);
        console.log('===============================');
        console.log( response.candidates[0].content.parts[0] );

        const functionCall = response.candidates[0].content.parts[0].functionCall;

        if (
                functionCall
            &&  functionCall.name === "searchProducts"
        ) {
            console.log(`Function to call: ${functionCall.name}`);
            console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);

            const { productName, category } = functionCall.args;
            const productsFound = await searchProducts(productName, category);
            console.log("Products found:", productsFound);

            const functionResponse = {
                name: "searchProducts",
                response: { productsFound },
            };

            contents.push(response.candidates[0].content);
            contents.push({ role: 'role', parts: [{ functionResponse: functionResponse }] });
            
            console.log(`contenrts for follow-up: ${JSON.stringify(contents)}`);

            const followUpResult = await ai.models.generateContent({
                model,
                config,
                contents
            });

            console.log("Follow-up response:", followUpResult);
            return followUpResult;
        } else {
            console.log("No function call found in the response.");
            //return response.text();
        }

        return response;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Log more details if available, like error.response.candidates
        return `Error: ${error.message}`;
    }
};


const getGeminiResponse = async (req, res) => {
    try {

        const newData = req.body;
        //const data = await generateBotResponse(newData);
        const data = await callGeminiApi(newData);
        // Send a response back to the client
        res.status(201).json(data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export default {
    getGeminiResponse
};