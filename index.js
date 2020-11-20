const express = require("express");
const app = express();
const db = require("./models/index");
global.fetch = require('node-fetch');

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.post("/create", function (req, res) {
    db.TestClass.create({
        attr1: "test",
    }).then(() => {
        res.send("Data Created.");
    });
});

app.get("/shoptest",async function(req,res) { 
   const areaCode =req.query.areaCode;
   const keyword=req.query.keyword;
   const exceptWord=req.query.exceptWord;

    res.send(areaCode+keyword+exceptWord);
});

app.get("/shops",async function(req,res) { 
    const areaCode =req.query.areaCode;
    const keyword=req.query.keyword;
    const exceptWord=req.query.exceptWord;
 
    const URL="https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=9cba381f3c60076f4d986a0f6ee580b3"
    let str="";
    if(areaCode===undefined){
        res.sendStatus(500);
    }else if(keyword===undefined){
        str = "&areacode_s="+areaCode;
        console.log(keyword);
    }else{
        console.log(keyword);
        str = "&areacode_s="+areaCode+"&freeword="+encodeURIComponent(keyword);

    }
    console.log(URL+str);

    const r =await fetch(URL+str);
    const data = await r.json();
    //console.log(data);

    //res.send(keyword);
    res.send(data);
 });


app.listen(3000, () => console.log("Example app listening on port 3000!"));