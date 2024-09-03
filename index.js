const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express().use(bodyParser.json());
const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

// Default port setup
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Webhook is listening on port ${PORT}`);
});

// To verify the callback URL from dashboard side (cloud API side)
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send("Forbidden");
        }
    } else {
        res.status(400).send("Bad Request");
    }
});

app.post("/webhook", (req, res) => {
    const bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));
    
    if (bodyParam.object) {
        if (bodyParam.entry &&
            bodyParam.entry[0].changes &&
            bodyParam.entry[0].changes[0].value.messages &&
            bodyParam.entry[0].changes[0].value.messages[0]
        ) {
            const phoneNumberId = bodyParam.entry[0].changes[0].value.metadata.phone_number_id;
            const from = bodyParam.entry[0].changes[0].value.messages[0].from;
            const messageBody = bodyParam.entry[0].changes[0].value.messages[0].text.body;

            axios({
                method: "POST",
                url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages?access_token=${token}`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: "Hi! I'm Prasath."
                    }
                },
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                console.log("Message sent successfully");
            })
            .catch(error => {
                console.error("Error sending message:", error);
            });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Hello, this is the webhook setup");
});

const app = express();
const PORT = process.env.PORT || 8000;
const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

// Middleware setup
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Start the server
app.listen(PORT, () => {
    console.log(`Webhook is listening on port ${PORT}`);
});

// Verification for the callback URL from the dashboard
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send("Forbidden");
        }
    } else {
        res.status(400).send("Bad Request");
    }
});

// Handle incoming webhook events
app.post("/webhook", (req, res) => {
    const bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));
    
    if (bodyParam.object) {
        if (bodyParam.entry &&
            bodyParam.entry[0].changes &&
            bodyParam.entry[0].changes[0].value.messages &&
            bodyParam.entry[0].changes[0].value.messages[0]
        ) {
            const phoneNumberId = bodyParam.entry[0].changes[0].value.metadata.phone_number_id;
            const from = bodyParam.entry[0].changes[0].value.messages[0].from;
            const messageBody = bodyParam.entry[0].changes[0].value.messages[0].text.body;

            // Respond with JSON that includes the message data
            res.status(200).json({ 
                status: "success", 
                message: "message sent",  
                body: `Hi! I'm Prasath. Your message is: ${messageBody}`, 
                from: `${from}` 
            });
            
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

// Basic endpoint to confirm server is running
app.get("/", (req, res) => {
    res.status(200).sendFile(__dirname + "/Autofile/index.php");
});
