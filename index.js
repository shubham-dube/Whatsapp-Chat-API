const express = require("express");
const bodyParser = require("body-parser");
const webhook = require('./webhook')
const axios = require("axios");
const app = express();
require('dotenv').config();
const helmet = require('helmet');
app.use(helmet());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Webhook Server is listening on port ${PORT}`);
});

// Verification for the callback URL from the dashboard
app.get("/webhook", webhook.WEBHOOK_CALLBACK);

// Handle incoming webhook events
app.post("/webhook", webhook.WEBHOOK_EVENT_HANDLER);

app.post("/sendMessage", webhook.SEND_MESSAGE);

// Basic endpoint to confirm server is running
app.get("/", (req, res) => res.status(200).send("Webhook Server is Running Fine !"));
