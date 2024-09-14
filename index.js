const express = require("express");
const bodyParser = require("body-parser");
const webhook = require('./webhook')
const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000;
const token = process.env.TOKEN;
const authKey = process.env.AUTHKEY;

app.listen(PORT, () => {
    console.log(`Webhook Server is listening on port ${PORT}`);
});

// Verification for the callback URL from the dashboard
app.get("/webhook", webhook.WEBHOOK_CALLBACK);

// Handle incoming webhook events
app.post("/webhook", webhook.WEBHOOK_EVENT_HANDLER);

// Basic endpoint to confirm server is running
app.get("/", (req, res) => res.status(200).send("Webhook Server is Running Fine !"));
