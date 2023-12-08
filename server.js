const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env
const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle POST requests from the frontend
app.use(express.json());

// Endpoint for handling OpenAI requests
app.post('/openai', async (req, res) => {
  try {
    // Get text from the request body
    const text = req.body.text;

    // TODO: Make a request to OpenAI API using Axios
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/engines/davinci/completions',
      {
        prompt: text,
        max_tokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Send the OpenAI response back to the frontend
    res.json({ response: openaiResponse.data.choices[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
