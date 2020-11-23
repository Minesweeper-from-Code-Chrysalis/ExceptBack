const express = require("express");
const app = express();
const db = require("./models/index");
global.fetch = require("node-fetch");

const setupServer = () => {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.get("/", function(req, res) {
    res.send("Hello World!");
  });

  app.post("/create", function(req, res) {
    db.Test.create({
      shopid: "6956991",
      uwasa: "汚い"
    }).then(() => {
      res.send("Data Created.");
    });
  });

  app.get("/c", async function(req, res) {
    const s = await fetch(
      `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?keyid=9cba381f3c60076f4d986a0f6ee580b3&area=${encodeURIComponent(
        "東京"
      )}&hit_per_page=50`
    );
    const data = await s.json();
    const arr = [];
    for (let key = 0; key < 50; key++) {
      const Ob = {};
      Ob.shopid = data.response[key].photo.shop_id;
      Ob.uwasa = data.response[key].photo.comment;
      Ob.updatedAt = new Date().toDateString();
      Ob.createdAt = new Date().toDateString();
      arr.push(Ob);
    }

    res.send(arr);
  });

  app.get("/shoptest", async function(req, res) {
    const { areaCode } = req.query;
    const { keyword } = req.query;
    const { exceptWord } = req.query;

    res.send(areaCode + keyword + exceptWord);
  });

  app.get("/shops", async function(req, res) {
    const { areaCode } = req.query;
    const { keyword } = req.query;
    const { exceptWord } = req.query;

    const URL =
      "https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=9cba381f3c60076f4d986a0f6ee580b3&hit_per_page=100";
    let str = "";
    if (areaCode === undefined) {
      res.sendStatus(400);
    } else if (keyword === undefined) {
      str = `&areacode_s=${areaCode}`;
    } else {
      str = `&areacode_l=${areaCode}&freeword=${encodeURIComponent(keyword)}`;
    }

    const r = await fetch(URL + str);
    const data = await r.json();


    if(data["error"]===undefined){
        selectShopId = data.rest.map(data => data.id);
        console.log(selectShopId);
    }else{
        res.sendStatus(400);
    }


    if (exceptWord === undefined) {
      res.send(data.rest);
    } else {
      const uwasas = await db.Test.findAll({
        where: {
          shopid: selectShopId
        },
        raw: true
      });

      console.log(uwasas);

      const exceptId = uwasas
        .filter(uwasa => {
          return uwasa.uwasa.indexOf(exceptWord) !== -1;
        })
        .map(uwasa => {
          return uwasa.shopid;
        });

      console.log(exceptId);
      if (exceptId === []) {
        console.log(exceptId);
        res.send(data.rest);
      } else {
        const allList = data.rest.filter(uwasa => {
          return exceptId.indexOf(uwasa.id) === -1;
        });
        console.log(allList.length);
        res.send(allList);
      }
    }
  });

  return app;
};

module.exports = { setupServer };