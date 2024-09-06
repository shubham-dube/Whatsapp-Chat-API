const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('./model');
const PORT = process.env.PORT || 8000;
const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(bodyParser.json());

// Start the server
app.listen(PORT, () => {
    console.log(`Webhook is listening on port ${PORT}`);
});

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
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
app.post("/webhook", async (req, res) => {
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
            const sender_Number = bodyParam.entry[0].changes[0].value.contacts[0].wa_id;

            try {
                // Send auto-reply message via WhatsApp API
                const response = await axios({
                    method: "POST",
                    url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages?access_token=${token}`,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: `Hi! I'm RidoBiko. Your message is: ${messageBody}`
                        }
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                console.log("Message sent successfully:", response.data);

                // Store the message in the database
                const status = "success";
                const message = "Message sent";
                const newMessage = new Message({ status, message, messageBody, sender_Number });
                await newMessage.save();

                // Send the response back to the client
                res.status(200).json({
                    status: "success",
                    message: "Message sent and stored successfully",
                    body: `${messageBody}`,
                    from: `${sender_Number}`
                });
            } catch (error) {
                console.error("Error sending message or saving to DB:", error);
                res.status(500).json({ status: "error", message: "Failed to send message or store data" });
            }
        } else {
            res.status(404).send("No message found in webhook");
        }
    } else {
        res.status(404).send("No object found in webhook");
    }
});

// Retrieve all stored messages
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve messages', error });
    }
});

// Retrieve the latest 10 messages
app.get('/latest_messages', async (req, res) => {
    try {
        const latestEntries = await Message.find().sort({ createdAt: -1 }).limit(10);
        res.json(latestEntries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching entries' });
    }
});

// Basic endpoint to confirm server is running
app.get("/", (req, res) => {
    res.status(200).send("Hello, this is the webhook setup");
});
