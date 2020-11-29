import dotenv from "dotenv";
import AWS from "aws-sdk";
import { Client } from "@elastic/elasticsearch";
import createAwsElasticsearchConnector from "aws-elasticsearch-connector";

dotenv.config();

// ElasticSearchServiceのクライアントを生成
export const generateClient = async (region, domainName) => {
  AWS.config.update({ region });
  const es = new AWS.ES({ apiVersion: "2015-01-01" });

  const domain = await es
    .describeElasticsearchDomain({ DomainName: domainName })
    .promise();
  const endpoint = domain.DomainStatus.Endpoint;
  const client = new Client({
    ...createAwsElasticsearchConnector(AWS.config),
    node: `https://${endpoint}`,
  });
  return client;
};

// index作成
export const createIndex = async () => {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const domainName = process.env.ES_DOMAIN_NAME || "except";
  const client = await generateClient(region, domainName);
  client.indices.create({
    index: "comments",
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
// バルクロード

// 検索
