import _ from "lodash";
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import log4js from "log4js";
import expressValidator from "express-validator";
import { search } from "../es/search.js";
import { createLogger, concatURLQuery, getSSMParameter } from "../common.js";

dotenv.config();
const app = express();
const { query, validationResult } = expressValidator;

const logger = createLogger();
const GNAVI_RESTAURANT_URL = "https://api.gnavi.co.jp/RestSearchAPI/v3/";
const DEFAULT_HIT_PER_PAGE = 100;
const { AWS_REGION, GNAVI_API_KEY_NAME, ES_DOMAIN_NAME } = process.env;
const index = "comments";

export const setupServer = () => {
  app.use(log4js.connectLogger(logger));
  app.use(cors());

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get(
    "/shops",
    [
      query("areaCode").exists().notEmpty().withMessage("検索エリアは必須です"),
      query("lowerBudget").isInt(),
      query("upperBudget").isInt(),
    ],
    async (req, res) => {
      const { areaCode, keyword, exceptWord } = req.query;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errorMessages: errors.array() });
      }

      // クエリパラメータを設定
      const API_KEY = await getSSMParameter(AWS_REGION, GNAVI_API_KEY_NAME);
      const params = {
        keyid: API_KEY,
        areacode_l: areaCode,
      };
      _.defaults(params, { hit_per_page: DEFAULT_HIT_PER_PAGE });
      if (keyword) {
        params.freeword = keyword;
      }

      // ぐるなびAPIのfetch
      const fetchURL = concatURLQuery(GNAVI_RESTAURANT_URL, params);
      const fetchRes = await fetch(fetchURL);
      const shopList = await fetchRes
        .json()
        .catch((err) => res.status(500).send(err));

      if (!exceptWord) {
        return res.send(shopList.rest);
      }

      const searchBody = {
        query: {
          bool: {
            must_not: exceptWord.split(",").map((word) => {
              return { match: { comments: word } };
            }),
          },
        },
      };
      const exceptShopList = await search(
        AWS_REGION,
        ES_DOMAIN_NAME,
        index,
        searchBody
      );
      const exceptShopIds = exceptShopList.body.hits.hits.map(
        (shop) => shop._source.shop_id
      );

      const filteredShopList = shopList.rest.filter((rest) => {
        return !exceptShopIds.includes(rest.id);
      });
      return res.send(filteredShopList);
    }
  );

  return app;
};
