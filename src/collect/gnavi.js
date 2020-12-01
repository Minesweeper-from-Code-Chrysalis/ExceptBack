import AWS from "aws-sdk";
import fetch from "node-fetch";
import dotenv from "dotenv";
import _ from "lodash";
import {
  zeroPad,
  getSSMParameter,
  concatURLQuery,
  TOKYO_AREA_LIST,
} from "../common.js";

dotenv.config();

const GNAVI_MAX_HIT_PER_PAGE = 50;
const GNAVI_RECORD_PER_PAGE = 1000;
const CHUNK_SIZE = 1000;
const GNAVI_COMMENTS_URL = "https://api.gnavi.co.jp/PhotoSearchAPI/v3/";

// 応援コメントのフィルター
export const filterGnaviComments = (data) => {
  return Object.values(data).map((comment) => {
    return comment.photo;
  });
};

// ぐるなびAPIからの口コミ情報取得
export const getGnaviComments = async (params, filter) => {
  const fetchRes = await fetch(
    concatURLQuery(GNAVI_COMMENTS_URL, params)
  ).catch((err) => console.log(err));
  console.log("fetch!!!!!!");
  const data = await fetchRes.json().catch((err) => console.log(err));
  if (!data.response) {
    const err = {
      params,
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
      const params = {
        keyid: apiKey,
        hit_per_page: GNAVI_MAX_HIT_PER_PAGE,
        sort: 1, // 降順
        offset: _start % GNAVI_RECORD_PER_PAGE,
        offset_page: Math.floor(_start / GNAVI_RECORD_PER_PAGE) + 1,
        area,
      };
      const c = await getGnaviComments(params, filterGnaviComments).catch(
        (err) => {
          console.log(err);
          return Promise.resolve(_comments);
        }
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
      Key: `gnavi_comments/${area}/${zeroPad(_start, 5)}_${zeroPad(
        _end,
        5
      )}.json`,
      Body: JSON.stringify(arr),
    };
    await s3
      .putObject(params)
      .promise()
      .catch((err) => console.log(err));
  });
  return comments;
};

// 東京の口コミ情報を1000件ずつ取得
export const tokyoCommentsCollect = async (start = 1, end = 1000) => {
  const areas = TOKYO_AREA_LIST;
  areas.map((area) => {
    return collectGnaviComments(area, end, start);
  });
};
