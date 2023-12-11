// const express = require('express');
// const axios = require('axios');
// require('dotenv').config();
// const app = express();
// const port = 3000;

// // Serve static files (HTML, CSS, JS)
// app.use(express.static('public'));

// // Handle POST requests from the frontend
// app.use(express.json());

// // Endpoint for handling OpenAI requests
// app.post('/openai', async (req, res) => {
//   try {
//     // Get text from the request body
//     const text = req.body.text;

//     // TODO: Make a request to OpenAI API using Axios
//     const openaiResponse = await axios.post(
//         'https://api.openai.com/v1/engines/davinci-codex/completions', // Updated endpoint for GPT-3.5-turbo (formerly davinci-codex)
//       {
//         prompt: text,
//         max_tokens: 100,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );

//     // Send the OpenAI response back to the frontend
//     res.json({ response: openaiResponse.data.choices[0].text });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });


// Tutorial code that works
// require('dotenv').config(); // Load environment variables from .env
// const OpenAI =  require("openai");

// const openai = new OpenAI();

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content: "You are a helpful assistant." }],
//     model: "gpt-3.5-turbo",
//   });

//   console.log(completion.choices[0]);
// }

// main();


import express from "express";
import bodyParser from "body-parser";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import 'dotenv/config'
import OpenAI  from "openai";

const openai = new OpenAI();
const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname + "/public")));
var jsonParser = bodyParser.json();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Endpoint for handling OpenAI requests
app.post('/openai', jsonParser, async (req, res) => {
  try {
    // Get text from the request body
    const text = req.body.text;
    
      const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: text }],
            model: "gpt-3.5-turbo",
        });

        // Send the OpenAI response back to the frontend
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});