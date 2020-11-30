import _ from "lodash";
import log4js from "log4js";
import AWS from "aws-sdk";

// 数値のゼロパディング
export const zeroPad = (num, length) => {
  return _.padStart(num.toString(), length, "0");
};

// S3のbodyをJSON形式に変換
export const s3BodyToJson = (body) => {
  return JSON.parse(body.toString());
};

// クエリパラメータURL結合
export const concatURLQuery = (url, params) => {
  const qs = new URLSearchParams(params);
  return `${url}?${qs}`;
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

// loggerを作成
export const createLogger = () => {
  log4js.configure({
    appenders: {
      out: {
        type: "stderr",
      },
    },
    categories: {
      default: {
        appenders: ["out"],
        level: "debug",
      },
    },
  });
  return log4js.getLogger();
};
