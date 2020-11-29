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
