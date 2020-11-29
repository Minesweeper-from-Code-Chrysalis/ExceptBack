import AWS from "aws-sdk";
import fetch from "node-fetch";
import dotenv from "dotenv";
import _ from "lodash";

dotenv.config();

// 応援コメントのフィルター
export const filterGnaviComments = async (data) => {
  return Object.values(data).map((comment) => {
    return _.pick(comment.photo, [
      "vote_id",
      "shop_name",
      "shop_id",
      "shop_url",
      "menu_name",
      "comment",
      "category",
      "latitude",
      "longitude",
    ]);
  });
};

// SystemsManagerからパラメータを取得
export const getSSMParameter = async (region, name) => {
  AWS.config.update({ region });
  const ssm = new AWS.SSM();
  const request = {
    Name: name,
  };
  const res = await ssm.getParameter(request).promise();
  return res.Parameter.Value;
};

// ぐるなびAPIからの口コミ情報取得
export const getGnaviComments = async (apiKey, area, offset, filter) => {
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
