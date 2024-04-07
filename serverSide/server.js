import express from "express";
import bodyParser from "body-parser";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import OpenAI from "openai";
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import https from "https";

const openai = new OpenAI();
const app = express();
const port = 8080;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname), express.static("clientSide"));
var jsonParser = bodyParser.json();
/*
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
*/

const httpsOptions = {
    key: fs.readFileSync("/home/sangwonlee/twcwnudge/twist_q/cert/key.pem"),
    cert: fs.readFileSync(
        "/home/sangwonlee/twcwnudge/twist_q/cert/twcwnudge.cs.vt.edu.crt"
    ),
};

https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Server started on https://localhost:${port}`);
});

// Endpoint for handling OpenAI requests
app.post("/openai", jsonParser, async (req, res) => {
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
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to handle saving button press
app.post("/save-button-press", jsonParser, async (req, res) => {
    const { prolificID, prompt, scNum, scTopic, saveArray } = req.body;

    try {
        // Search for an existing document
        let save = await db
            .collection("records")
            .findOne({ prolificID, prompt });

        if (!save) {
            // If no document exists, create a new one
            save = {
                prolificID,
                prompt,
                scNum,
                scTopic,
                saves: saveArray,
            };
            // Insert the new document
            await insertRecord(save);
            writeOKResponse(res, "Data saved successfully.", save);
        } else {
            // If document exists, update it
            save.saves.push(...saveArray);
            // Update the existing document
            await updateRecord(
                { prolificID, prompt },
                { $set: { saves: save.saves } }
            );
            writeOKResponse(res, "Data appended successfully.", save);
        }
    } catch (error) {
        console.error(error);
        writeBadRequestResponse(res, "Internal server error.");
    }
});

let insertRecord = function (data, callback) {
    records.insertOne(data);
    console.log(
        "insertRecord: Inserted a document into the records collection: " +
            data._id
    );
    if (callback) callback(data);
};

let updateRecord = async function (query, update, callback) {
    try {
        await records.updateOne(query, update);

        console.log("updateRecord: Updated a document in records");
        if (callback) callback();
    } catch (error) {
        console.error("Error updating tweet:", error);
        if (callback) callback(error);
    }
};

//https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
let writeOKResponse = function (res, message, data) {
    let obj = {
        status: "OK",
        message: message,
        data: data,
    };
    console.log("writeOKResponse: " + message);

    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(obj));
};

let writeBadRequestResponse = function (res, message) {
    console.log("writeBadRequestResponse: " + message);
    res.writeHead(400, { "Content-type": "text/plain" });
    res.end(message);
};

const client = new MongoClient(
    "mongodb://localhost:27017/twist?directConnection=true"
);

let db;
let records;

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("twist").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        // Get the reference to the database and collection
        db = client.db("twist");
        records = db.collection("records");
        if (records == null) {
            // If the collection doesn't exist, create it
            records = await db.createCollection("records");
            console.log("records collection does not exist so created");
        }
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
