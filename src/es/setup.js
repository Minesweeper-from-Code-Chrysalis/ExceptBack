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
          shop_id: {
            type: "keyword",
          },
          shop_name: {
            type: "text",
            analyzer: "kuromoji",
          },
          menu_name: {
            type: "text",
            analyzer: "kuromoji",
          },
          comment: {
            type: "text",
            analyzer: "kuromoji",
          },
        },
      },
    },
  });
};

// 応援コメントのフィルター
// ※本来はLogStashなどを利用するべきであり、一時的な利用に限定
export const commentsDocumentFilter = (comments) => {
  return comments.map((comment) => {
    const filtered = _.pick(comment, [
      "shop_id",
      "shop_name",
      "menu_name",
      "comment",
    ]);
    filtered.id = comment.vote_id;
    return filtered;
  });
};

// S3のjsonファイルをElasticSearchServiceにバルクロード
export const bulkLoad = async (start, end, area, filter) => {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  AWS.config.update({ region });
  const bucket = process.env.S3_BUCKET;
  const s3 = new AWS.S3({ region });

  const params = {
    Bucket: bucket,
    Key: `gnavi_comments/${area}/${zeroPad(start, 5)}_${zeroPad(end, 5)}.json`,
  };
  const res = await s3.getObject(params).promise();
  const dataset = filter(s3BodyToJson(res.Body));
  const body = dataset.flatMap((doc) => [{ index: { _index: index } }, doc]);

  const client = await generateClient(region, domainName);
  await client.bulk({ refresh: true, body });
};
