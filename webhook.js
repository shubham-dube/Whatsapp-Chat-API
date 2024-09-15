const axios = require("axios");
const { json } = require("body-parser");
require('dotenv').config();

const Graph_API_Token = process.env.GRAPH_API_TOKEN;
const Webhook_Verify_Token = process.env.WEBHOOK_VERIFY_TOKEN;

exports.WEBHOOK_CALLBACK = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    // Check if the mode and token are correct
    if (mode === 'subscribe' && token === Webhook_Verify_Token) {
      console.log('Webhook Verified Successfully');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

exports.WEBHOOK_EVENT_HANDLER = async (req, res) => {

    const messageObject = req.body;
    console.log("messageObject: " + json.toString(messageObject))

    if (messageObject.object) {
        if (messageObject.entry && messageObject.entry[0].changes && messageObject.entry[0].changes[0].value.messages &&
            messageObject.entry[0].changes[0].value.messages[0]) {

            const phoneNumberId = messageObject.entry[0].changes[0].value.metadata.phone_number_id;
            const from = messageObject.entry[0].changes[0].value.messages[0].from;
            const messageBody = messageObject.entry[0].changes[0].value.messages[0].text.body;
            const sender_Number=messageObject.entry[0].changes[0].value.contacts[0].wa_id;

            axios({
                method: "POST",
                url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages?access_token=${Graph_API_Token}`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: `Your Message is ${messageBody}`
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
            console.log("outside");

            try {
                const postData = {
                    mobile_number: sender_Number,
                    message: messageBody,
                    sender: 'user'
                  };
                  console.log(postData);
                  
                  axios.post('https://twowheelerrental.in/whatsapp/chat_api/store_message.php', postData)
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
}

exports.SEND_MESSAGE = async (req, res) => {
    const { phoneNumberId, recipientPhoneNumber, messageBody } = req.body;
    
    if (!phoneNumberId || !recipientPhoneNumber || !messageBody) {
        return res.status(400).json({ status: "error", message: "Missing required parameters" });
    }

    try {
        const response = await axios({
            method: "POST",
            url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages?access_token=${Graph_API_Token}`,
            data: {
                messaging_product: "whatsapp",
                to: recipientPhoneNumber,
                text: {
                    body: messageBody
                }
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        res.status(200).json({ status: "success", data: response.data });
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
        res.status(500).json({ status: "error", message: "Failed to send message", error: error.response?.data || error.message });
    }
}