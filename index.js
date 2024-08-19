const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express().use(body_parser.json());
const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.listen(8000 || process.env.PORT, () => {
    console.log("Webhook is listening");
});

// To verify the callback URL from dashboard side (cloud API side)
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

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
    let bodyParam = req.body;
    console.log(JSON.stringify(bodyParam, null, 2));
    if (bodyParam.object) {
        if (bodyParam.entry &&
            bodyParam.entry[0].changes &&
            bodyParam.entry[0].changes[0].value.messages &&
            bodyParam.entry[0].changes[0].value.messages[0]
        ) {
            let phoneNumberId = bodyParam.entry[0].changes[0].value.metadata.phone_number_id;
            let from = bodyParam.entry[0].changes[0].value.messages[0].from;
            let messageBody = bodyParam.entry[0].changes[0].value.messages[0].text.body;

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
            }).then(response => {
                console.log("Message sent successfully");
            }).catch(error => {
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
