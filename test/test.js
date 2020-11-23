const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { setupServer } = require("../server");
chai.should();
const db = require("../models/index");

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


  
});
