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
const DEFAULT_HIT_PER_PAGE = 20;
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
      query("keyword").optional({ nullable: true }).isString(),
      query("exceptWord").optional({ nullable: true }).isString(),
      query("lowerBudget").exists().withMessage("予算の下限値は必須です"),
      query("upperBudget").exists().withMessage("予算の上限値は必須です"),
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
      const fetchRes = await fetch(fetchURL).catch((err) =>
        res.status(500).send(err)
      );
      const shopList = await fetchRes
        .json()
        .catch((err) => res.status(500).send(err));

      if (!exceptWord) {
        return res.send(shopList.rest);
      }

      const searchBody = {
        query: {
          bool: {
            should: exceptWord.split(",").reduce((arr, word) => {
              return arr.concat([
                { match: { comment: word } },
                { match: { shop_name: word } },
              ]);
            }, []),
          },
        },
      };

      const exceptShopList = await search(
        AWS_REGION,
        ES_DOMAIN_NAME,
        index,
        searchBody
      ).catch((err) => res.status(500).send(err));
      console.log(searchBody);
      console.log(exceptShopList.body);

      const exceptShopIds = exceptShopList.body.hits.hits.map(
        (shop) => shop._source.shop_id
      );

      const filteredShopList = shopList.rest.filter((rest) => {
        // 除外店舗一覧に含まれる店舗を除外
        let isExcept = exceptShopIds.includes(rest.id);

        // 店舗名に除外ワードが含まれる店舗を除外
        exceptWord.split(",").forEach((exWord) => {
          isExcept = isExcept || rest.name.includes(exWord);
        });
        return !isExcept;
      });
      return res.send(filteredShopList);
    }
  );
  return app;
};
