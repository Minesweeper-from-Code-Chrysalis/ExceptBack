import dotenv from "dotenv";
import { generateClient } from "./client.js";

dotenv.config();

export const search = async (region, domainName, index, body) => {
  const client = await generateClient(region, domainName);
  const res = await client.search({ index, body });
  return res;
};
