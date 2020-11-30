# サンプル

```js
const index = "comments";
const region = process.env.AWS_REGION || "ap-northeast-1";
const domainName = process.env.ES_DOMAIN_NAME || "except";


// commentがパクチーにマッチするdocumentを抽出
search(region, domainName, index, {
  query: {
    match: {
      comment: "パクチー"
    }
  }
});
```