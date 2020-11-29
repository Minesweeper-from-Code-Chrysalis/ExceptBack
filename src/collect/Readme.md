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

ぐるなびAPIから応援口コミを取得
```js
const exampleGetGnaviComments = async () => {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const keyName = process.env.GNAVI_API_KEY_NAME;

  const apiKey = await getSSMParameter(region, keyName);
  const comments = await getGnaviComments(apiKey, "東京", 1, filterGnaviComments);
  console.log(comments);
}

exampleGetGnaviComments();
```

東京の応援口コミを1500件取得し、S3にjson形式で保存
```js
collectGnaviComments("東京", 1500);
```