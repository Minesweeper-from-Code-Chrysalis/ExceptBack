# サンプルコード

## 事前準備
1. ぐるなびAPIキーを取得する
1. AWS Systems ManagerパラメータストアにぐるなびAPIキーを設定する
    - ここで設定したパラメータ名を.envファイルの`GNAVI_API_KEY_NAME`に対応させる
1. .envファイルを作成する
    ```
    AWS_REGION = ap-northeast-1
    GNAVI_API_KEY_NAME = xxxxx
    ```

## サンプル

```js
// ぐるなびAPIから応援口コミを取得
const exampleGetGnaviComments = async () => {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const keyName = process.env.GNAVI_API_KEY_NAME;

  const apiKey = await getSSMParameter(region, keyName);
  const comments = await getGnaviComments(apiKey, "東京", 1, filterGnaviComments);
  console.log(comments);
}

exampleGetGnaviComments();
```