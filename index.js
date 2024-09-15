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
const Graph_API_Token = process.env.GRAPH_API_TOKEN;
const Webhook_Verify_Token = process.env.WEBHOOK_VERIFY_TOKEN;

app.listen(PORT, () => {
    console.log(`Webhook Server is listening on port ${PORT}`);
});

// Verification for the callback URL from the dashboard
app.get("/webhook", webhook.WEBHOOK_CALLBACK);

// Handle incoming webhook events
app.post("/webhook", async (req, res) => {

    const bodyParam = req.body;
    console.log("body parameters : " + bodyParam);
    console.log(JSON.stringify(bodyParam, null, 2));

    if (bodyParam.object) {
        if (bodyParam.entry && bodyParam.entry[0].changes && bodyParam.entry[0].changes[0].value.messages &&
            bodyParam.entry[0].changes[0].value.messages[0]) {

            const phoneNumberId = bodyParam.entry[0].changes[0].value.metadata.phone_number_id;
            const from = bodyParam.entry[0].changes[0].value.messages[0].from;
            const messageBody = bodyParam.entry[0].changes[0].value.messages[0].text.body;
            const sender_Number=bodyParam.entry[0].changes[0].value.contacts[0].wa_id;

            axios({
                method: "POST",
                url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages?access_token=${Graph_API_Token}`,
                data: {
                    messaging_product: "whatsapp",
                                to: from,
                                text: {
                                    body: `Hi! I'm Prasath. Your message is: ${messageBody}`
                                }
                            },
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })
                        .then(response => {
                            console.log("Message sent successfully:", response.data);
                            res.status(200).json({ status: "success", data: response.data });
                        })
                        .catch(error => {
                            console.error("Error sending message:", error);
                            res.status(500).json({ status: "error", message: "Failed to send messagesss" });
                        });
            const status="success"
            const message="Message sent"
            try {
                // const { status, message, body, form } = req.body;
                // const newMessage = new Message({ status, message, messageBody, sender_Number });
                // await newMessage.save();

                const postData = {
                    mobile_number: sender_Number,
                    message: messageBody,
                    sender: 'user'
                  };
                  
                  axios.post('http://localhost/whatsapp-apis/chat_api/store_message.php', postData)
                    .then(response => {
                      console.log(`Response: ${response.data}`);
                    })
                    .catch(error => {
                      console.error(`Error: ${error}`);
                    });
        
                // res.status(201).json({ message: 'Message stored successfully', data: newMessage });
                res.status(200).json({ status: "success", message: "message sent",  body: ` ${messageBody}` ,form:`${sender_Number}`});
            } catch (error) {
                res.status(500).json({ message: 'Failed to store message', error });
            }
            
            // res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

// Basic endpoint to confirm server is running
app.get("/", (req, res) => res.status(200).send("Webhook Server is Running Fine !"));
