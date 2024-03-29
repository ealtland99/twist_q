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

// Endpoint for handling the tweet save to the database
app.post("/save-original-tweet", jsonParser, async (req, res) => {
    try {
        const prolificID = req.body.prolificID;
        const prompt = req.body.prompt;
        const timestamp = req.body.timestamp;
        const event = req.body.event;
        const tweetText = req.body.tweetText;

        insertTweetRow(
            {
                prolificID: prolificID,
                prompt: prompt,
                saves: [
                    {
                        timestamp: timestamp,
                        event: event,
                        tweetText: tweetText,
                    },
                ],
            },
            function (data) {
                writeOKResponse(
                    res,
                    "Original tweet saved successfully (" + data._id + ")",
                    { _id: data._id }
                );
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint for handling the tweet save to the database
app.post("/save-revised-tweet", jsonParser, async (req, res) => {
    try {
        const tweetID = req.body.tweetID;
        const timestamp = req.body.timestamp;
        const event = req.body.event;
        const tweetText = req.body.tweetText;
        const userScanned = req.body.userScanned;
        const scDetected = req.body.scDetected;
        const openAIResponse = req.body.openAIResponse;

        updateTweetRow(
            { _id: new ObjectId(tweetID) },
            {
                $push: {
                    saves: {
                        timestamp: timestamp,
                        event: event,
                        tweetText: tweetText,
                        userScanned: userScanned,
                        scDetected: scDetected,
                        openAIResponse: openAIResponse,
                    },
                },
            },
            function (err) {
                if (err) {
                    writeBadRequestResponse(
                        res,
                        "An error occurred while updating the tweet" + err
                    );
                    return;
                }
                writeOKResponse(res, "Revised tweet saved successfully");
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

let insertTweetRow = function (data, callback) {
    tweets.insertOne(data);
    console.log(
        "insertTweetRow: Inserted a document into the tweets collection: " +
            data._id
    );
    if (callback) callback(data);
};

let updateTweetRow = async function (query, update, callback) {
    try {
        await tweets.updateOne(query, update);

        console.log("updateTweetRow: Updated a document in tweets");
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
let tweets;

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
        tweets = db.collection("tweets");
        if (tweets == null) {
            // If the collection doesn't exist, create it
            tweets = await db.createCollection("tweets");
            console.log("Tweets collection does not exist so created");
        }
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
