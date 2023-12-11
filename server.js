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

app.use(express.static(__dirname));
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