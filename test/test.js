import chai from "chai";
import chaiHttp from "chai-http";
import { setupServer } from "../src/server/server.js";
import { concatURLQuery } from "../src/common.js";
chai.use(chaiHttp);
chai.should();

// 検索結果が0となる検索ワード
const UNEXPECTED_KEYWORD = "_____";

const server = setupServer();

describe("API Server", () => {
  let request;
  const TEST_URL = "/shops";

  beforeEach(() => {
    request = chai.request(server);
  });

  describe(TEST_URL, () => {
    it("エリアコードが指定されていない場合、400を返す", async () => {
      const res = await request.get(TEST_URL);
      res.should.have.status(400);
    });

    it("検索結果が0件の場合、400を返す", async () => {
      const params = {
        keyword: UNEXPECTED_KEYWORD,
      };
      const url = concatURLQuery(TEST_URL, params);
      const res = await request.get(url);
      res.should.have.status(400);
    });

    it("エリアコードのみが指定された場合、200を返す", async () => {
      const params = {
        keyword: UNEXPECTED_KEYWORD,
      };
      const url = concatURLQuery(TEST_URL, params);
      const res = await request.get(url);
      res.should.have.status(400);
    });
  });
});
