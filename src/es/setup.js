import _ from "lodash";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import { generateClient } from "./client.js";
import { zeroPad, s3BodyToJson } from "../common.js";

dotenv.config();
const region = process.env.AWS_REGION || "ap-northeast-1";
const domainName = process.env.ES_DOMAIN_NAME || "except";
const index = "comments";

// index作成
export const createIndex = async () => {
  const client = await generateClient(region, domainName);
  client.indices.create({
    index,
    body: {
      mappings: {
        properties: {
          vote_id: {
            type: "keyword",
          },
          shop_name: {
            type: "text",
            analyzer: "kuromoji",
          },
          shop_id: {
            type: "keyword",
          },
          shop_url: {
            type: "keyword",
          },
          menu_name: {
            type: "text",
            analyzer: "kuromoji",
          },
          comment: {
            type: "text",
            analyzer: "kuromoji",
          },
          category: {
            type: "keyword",
          },
        },
      },
    },
  });
};

// S3のjsonファイルをElasticSearchServiceにバルクロード
export const bulkLoad = async (start, end) => {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  AWS.config.update({ region });
  const bucket = process.env.S3_BUCKET;
  const s3 = new AWS.S3({ region });

  const params = {
    Bucket: bucket,
    Key: `gnavi_comments/${zeroPad(start, 5)}_${zeroPad(end, 5)}.json`,
  };
  const res = await s3.getObject(params).promise();
  const dataset = s3BodyToJson(res.Body);
  const body = dataset.flatMap((doc) => [
    { index: { _index: "comments" } },
    doc,
  ]);

  const client = await generateClient(region, domainName);
  await client.bulk({ refresh: true, body });
};

// 一定の間隔でバルクロード
export const batchBulkLoad = (start, end) => {
  const batchRecords = 500;
  _.range(start, end, 1000).map((_start) =>
    bulkLoad(_start, _start + batchRecords)
  );
};
