import AWS from "aws-sdk";
import fetch from "node-fetch";
import dotenv from "dotenv";
import _ from "lodash";
import { zeroPad } from "../common.js";

dotenv.config();

const GNAVI_MAX_HIT_PER_PAGE = 50;
const GNAVI_RECORD_PER_PAGE = 1000;
const CHUNK_SIZE = 1000;

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
    ]);
  });
};

// SystemsManagerからパラメータを取得
export const getSSMParameter = async (region, name) => {
  AWS.config.update({ region });
  const ssm = new AWS.SSM();
  const request = {
    Name: name,
    WithDecryption: true,
  };
  const res = await ssm.getParameter(request).promise();
  return res.Parameter.Value;
};

// ぐるなびAPIからの口コミ情報取得
export const getGnaviComments = async (apiKey, area, offset, filter) => {
  const params = new URLSearchParams({
    keyid: apiKey,
    hit_per_page: GNAVI_MAX_HIT_PER_PAGE,
    sort: 1, // 降順
    offset: offset % GNAVI_RECORD_PER_PAGE,
    offset_page: Math.floor(offset / GNAVI_RECORD_PER_PAGE) + 1,
    area,
  });

  const fetchRes = await fetch(
    `https://api.gnavi.co.jp/PhotoSearchAPI/v3/?${params}`
  ).catch((err) => console.log(err));
  const data = await fetchRes.json().catch((err) => console.log(err));
  if (!data.response) {
    const err = {
      offset,
      area,
      error: data.gnavi.error,
    };
    throw new Error(JSON.stringify(err));
  }

  // 余分なデータ項目を削除
  delete data.response["@attributes"];
  delete data.response.total_hit_count;
  delete data.response.hit_per_page;
  return filter(data.response);
};

// ぐるなびAPIから口コミ情報を取得し、S3にアップロード
export const collectGnaviComments = async (area, end, offset = 1) => {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const keyName = process.env.GNAVI_API_KEY_NAME;
  const bucket = process.env.S3_BUCKET;
  const s3 = new AWS.S3({ region });
  const apiKey = await getSSMParameter(region, keyName);

  // GNAVI_MAX_HIT_PER_PAGEずつコメントを取得
  // Array Functionの中でasync/awaitを使う場合はループの処理を待つ必要がある
  const comments = await _.range(offset, end, GNAVI_MAX_HIT_PER_PAGE).reduce(
    async (promise, _start) => {
      const _comments = await promise;
      const c = await getGnaviComments(
        apiKey,
        area,
        _start,
        filterGnaviComments
      );
      return Promise.resolve(_comments.concat(c));
    },
    Promise.resolve([])
  );

  // CHUNK_SIZE毎にS3へアップロード
  _.chunk(comments, CHUNK_SIZE).map(async (arr, index) => {
    const _start = offset + CHUNK_SIZE * index;
    const _end = _.min([end, _start + CHUNK_SIZE - 1]);
    const params = {
      Bucket: bucket,
      Key: `gnavi_comments/${zeroPad(_start, 5)}_${zeroPad(_end, 5)}.json`,
      Body: JSON.stringify(arr),
    };
    await s3
      .putObject(params)
      .promise()
      .catch((err) => console.log(err));
  });
};

// 一定の間隔でcollectを実施
export const batchCollect = (area, start, end) => {
  // 本来的にはGNAVI_RECORD_PER_PAGEで良いはずだがぐるなびAPI側で400エラーが出る
  // batchCollect("東京", 1, 10000)
  const batchRecords = 500;
  _.range(start, end, GNAVI_RECORD_PER_PAGE).map((_start) =>
    collectGnaviComments(area, _start + batchRecords, _start)
  );
};
