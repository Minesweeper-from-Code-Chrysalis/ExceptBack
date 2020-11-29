import _ from "lodash";

export const zeroPad = (num, length) => {
  return _.padStart(num.toString(), length, "0");
};
