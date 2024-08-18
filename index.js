const express=require("express")
const body_parser=require("body-parser");
const { headers } = require("next/headers");
const axios=require("axios");
require('dotenv').config()

const app=express().use(body_parser.json());
const token= process.env.TOKEN;
const mytoken=process.env.MYTOKEN;

app.listen(8000||process.env.PORT,()=>{
    console.log("webhook is listeneing");
});

//to verify the callback url from dashboard side-cloud api side
app.get("/webhook",(req,res)=>{
    let mode=req.query["hub.mode"];
    let challange=req.query["hub.challenge"];
    let token=req.query["hub.verify_token"];

    
    if(mode && token){
        if(node=="subcribe" && token==mytoken){
            res.status(200).send(challange);
        }else{
            res.status(403);
        }
    }
});
app.post("/webhook",(req,res)=>{
    let boby_param=req.body;
    console.log(JSON.stringify(boby_param,null,2))
    if(body_param.object){
        if(body_param.entry && 
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.message &&
             body_param.entry[0].changes[0].value.message[0]
            ){
                let phon_no_id=boby_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = boby_param.entry[0].changes[0].value.message[0].from;
                let meg_body=body_param.entry[0].changes[0].value.message[0].text.body

                axios({
                    method:"POST",
                    url:" "+phon_no_id+"/messages?access_token="+token,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body:"Hii.. I'm prasath"
                        }
                    },
                    headers:{

                    }
                });
                res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }
    }
});   

app.get("/",(req,res)=>{
    res.status(200).send("hello this is webhook setup");
});