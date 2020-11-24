const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { setupServer } = require("../server");
chai.should();
//const db = require("../models/index");

const server = setupServer();
describe("API Server", () => {
  let request;
  beforeEach(() => {
    request = chai.request(server);
  });

  it("est.jsとserver.jsの疎通を確認する", async () => {
    //exercise
    const res = await request.get("/");
    //assert
    res.should.have.status(200);
    res.text.should.deep.equal("Hello World!");
  });

  it("postgresの疎通を確認する", async () => {
    //exercise
    const res = await request.post("/create");
    //assert
    res.should.have.status(200);
  });

  it("ぐるなびとの疎通を確認する", async () => {
    //exercise
    const res = await request.get("/c");
    //assert
    res.should.have.status(200);
    //res.text.should.deep.equal(50);
    JSON.parse(res.text).length.should.deep.equal(50);
  });

  it("/shoptest パラメータ受け取りを確認する", async () => {
    //exercise
    const res = await request.get(
      "/shoptest/?areaCode=aaa&keyword=bbb&exceptWord=ccc"
    );
    //assert
    res.should.have.status(200);
    res.text.should.deep.equal("aaabbbccc");
  });

  it("/shops エリアコードが存在せずエラーになる", async () => {
    //exercise
    const res = await request.get("/shops/?");
    //assert
    res.should.have.status(400);
  });

  it("/shops パラメータでの検索結果が０件でもレスポンスが返る", async () => {
    //exercise
    const res = await request.get("/shops/?areaCode=ASSS");
    //assert
    res.should.have.status(400);
  });

  it("/shops AreaCodeパラメータのみ指定すると正常終了する", async () => {
    //exercise
    const res = await request.get("/shops/?areaCode=AREAL2133");
    //assert
    res.should.have.status(200);
  });

  it("/shops AreaCodeパラメータのみ指定すると正常終了する", async () => {
    //exercise
    const res = await request.get("/shops/?areaCode=AREAL2133");
    //assert
    res.should.have.status(200);
  });

  it("/shops AreaCode,keywordパラメータを指定すると正常終了する", async () => {
    //exercise
    const res = await request.get(
      `/shops/?areaCode=AREAL2133&keyword=${encodeURIComponent("ラーメン")}`
    );
    //assert
    res.should.have.status(200);
  });

  it("/shops 全てのパラメータを指定すると正常終了する1", async () => {
    //exercise
    const res = await request.get(
      `/shops/?areaCode=AREAL2133&keyword=${encodeURIComponent(
        "ラーメン"
      )}&exceptWord=${encodeURIComponent("こってり")}`
    );
    //assert
    res.should.have.status(200);
  });

  it("/shops 全てのパラメータを指定すると正常終了する2", async () => {
    //exercise
    const res = await request.get(
      `/shops/?areaCode=AREAL2133&keyword=${encodeURIComponent(
        "ラーメン"
      )}&exceptWord=${encodeURIComponent("AAAAAA")}`
    );
    //assert
    res.should.have.status(200);
  });
});
