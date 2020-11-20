const express = require("express");
const app = express();
const db = require("./models/index");

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

app.listen(3000, () => console.log("Example app listening on port 3000!"));