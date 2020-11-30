const express = require("express");
const app = express();
const db = require("./models/index");
global.fetch = require("node-fetch");
require("dotenv").config();

const { env } = process;

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
    res.send("!!!Hello World Hoge!!!");
  });

  app.post("/create", function(req, res) {
    db.Test.create({
      shopid: "gfbz503",
      uwasa: "こってりしたとんこつラーメンがウリ"
    }).then(() => {
      res.send("Data Created.");
    });
  });

  app.get("/c", async function(req, res) {
    const s = await fetch(
      `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?keyid=${
        env.KEY_ID
      }&area=${encodeURIComponent("東京")}&hit_per_page=50&vote_date=365`
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

  //データセットアップ用のソースコード。（テスト不要）
  app.get("/areal", async function(req, res) {
    const s = await fetch(
      `https://api.gnavi.co.jp/master/GAreaLargeSearchAPI/v3/?keyid=${env.KEY_ID}`
    );
    const data = await s.json();
    const arr = data.garea_large.map(area => {
      return { a: area.areacode_l, b: area.pref.pref_code };
    });
    const ar = arr.filter(area => area.b === "PREF13");
    const a = [];

    for (let i = 0; i < ar.length - 1; i++) {
      const s = await fetch(
        `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?keyid=${env.KEY_ID}&area=${ar[i].a}&hit_per_page=50&vote_date=1000&order=vote_date&sort=1`
      );
      const data = await s.json();
      const count = data.response.total_hit_count;
      console.log(count);
      a.push({ a: ar[i].a, b: count });
    }

    const final = [];

    for (const l in a) {
      let syou = (a[l].b / 50) | 0;
      if (syou > 20) {
        syou = 20;
      }
      for (let k = 0; k <= syou; k++) {
        const s = await fetch(
          `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?keyid=${
            env.KEY_ID
          }&area=${a[l].a}&hit_per_page=50&order=vote_date&sort=1&offset=${k *
            50 +
            1}`
        );
        const data = await s.json();
        for (let key = 0; key < 50; key++) {
          const Ob = {};
          Ob.shopid = data.response[key].photo.shop_id;
          Ob.uwasa = data.response[key].photo.comment;
          Ob.updatedAt = new Date().toDateString();
          Ob.createdAt = new Date().toDateString();
          final.push(Ob);
        }
      }
    }
    res.send(final);
  });



/*
  app.get("/pac", async function(req, res) {
      const final=[];
      const s = await fetch(
        `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?keyid=${
          env.KEY_ID
        }&shop_id=gfa6100,gfa6102,a274815,ggrk900,gg4y103,gf56402,gegf400,gegf402,g739803&hit_per_page=50&order=vote_date&sort=1`);
      const data = await s.json();
      for (let key = 0; key < 10; key++) {
        const Ob = {};
        Ob.shopid = data.response[key].photo.shop_id;
        Ob.uwasa = data.response[key].photo.comment;
        Ob.updatedAt = new Date().toDateString();
        Ob.createdAt = new Date().toDateString();
        final.push(Ob);
      }
    
  
  res.send(final);
});
*/

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

    const URL = `https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${env.KEY_ID}&hit_per_page=100`;
    let str = "";
    if (areaCode === undefined) {
      res.sendStatus(400);
    } else if (keyword === undefined) {
      str = `&areacode_l=${areaCode}`;
    } else {
      str = `&areacode_l=${areaCode}&freeword=${encodeURIComponent(keyword)}`;
    }

    const r = await fetch(URL + str);
    const data = await r.json();
    let selectShopId = [];

    if (data.error === undefined) {
      selectShopId = data.rest.map(data => data.id);
      //   console.log(selectShopId);
    } else {
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

      // console.log(uwasas);

      const exceptId = uwasas
        .filter(uwasa => {
          return uwasa.uwasa.indexOf(exceptWord) !== -1;
        })
        .map(uwasa => {
          return uwasa.shopid;
        });

      console.log(exceptId);
      if (exceptId === []) {
        //console.log(exceptId);
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
