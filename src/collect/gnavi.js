import AWS from "aws-sdk";
import fetch from "node-fetch";
import dotenv from "dotenv";
import _ from "lodash";

AWS.config.update({
  region: "ap-northeast-1",
});
dotenv.config();

const ssm = new AWS.SSM();

// 応援コメントのフィルター
export const filterGnaviComments = async (data) => {
  return Object.values(data).map((comment) => {
    return _.pick(comment.photo, [
      "vote_id",
      "shop_name",
      "shop_url",
      "menu_name",
      "comment",
      "category",
      "latitude",
      "longitude",
      "messages",
    ]);
  });
};

// ぐるなびAPIからの口コミ情報取得
export const getGnaviComments = async (area, offset, filter) => {
  const request = {
    Name: process.env.GNAVI_API_KEY_NAME,
  };
  const ssmRes = await ssm.getParameter(request).promise();
  const apiKey = ssmRes.Parameter.Value;
  const params = new URLSearchParams({
    keyid: apiKey,
    vote_date: 365,
    hit_per_page: 50,
    area,
    offset,
  });
  const fetchRes = await fetch(
    `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?${params}`
  ).catch((err) => console.log(err));
  const data = await fetchRes.json().catch((err) => console.log(err));
  return filter(data.response);
};

// Example
// getGnaviComments("東京", 1, filterGnaviComments);
