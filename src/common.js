import _ from "lodash";

export const zeroPad = (num, length) => {
  return _.padStart(num.toString(), length, "0");
};

export const s3BodyToJson = (body) => {
  return JSON.parse(body.toString());
};
