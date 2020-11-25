# ExceptBack
このリポジトリは Code Chrysalis の生徒であるときに作成しました（This was created during my time as a student at Code Chrysalis）


## Exceptとは
**今日を失敗したくない、あなたのために。**

他人からオススメされたレストランに、自分が根本的に「合わない」要素が含まれていた
経験はありますか？
「他人のオススメは必ずしも自分の好みにはなり得ない」からこそ
レコメンド機能を充実させるのではなく、嫌いな要素を除外する機能を追加した
「嫌いなものを除外してから表示するレストラン検索機能」です。

## このプロジェクトは？
Exceptのバックエンド向けのProjectです。
※フロント機能は下記に作成されています。


ぐるなびAPIからレストラン情報を取得後、
Except側でPoolしている口コミ情報と突き合わせて、
除外ワードが存在する場合、
そのレストランを除外した検索結果をフロント側に返しています。



## 疎通確認手順
・git cloneしたあと、以下の手順でローカルDBをセットアップしてください。

```shell
yarn install
yarn global add sequelize-cli
```

**step1　Express疎通**

- [ ] 疎通確認(GET)
　- [ ] BackEndのシステムを実行
```shell
  yarn start
```
　- [ ] GET　　http://localhost:3001/

---**step2　Postgresとの疎通**

- [ ] .envファイルをプロジェクト直下に作成し、configで規定した変数を設定
- [ ] DBを作成する

 ``` shell
　yarn sequelize db:create
 ``` 

- [ ] MigrationしてTBLを作成（TestTBL）

``` shell
　yarn migrate
```
  
- [ ] データのセットアップを行う

``` shell
yarn seed
``` 

- [ ] 疎通確認(POST)
　- [ ] POST　　http://localhost:3000/create

**step3　ぐるなびAPIとの疎通+全体の疎通**

- [ ] ぐるなびAPIの新規アカウント登録を行い、keyIDを発行

　　[ぐるなびAPI　Topページ](https://api.gnavi.co.jp/api/)

- [ ] .envファイルに下記のように記載

```js
  KEY_ID=AAAAAAAAAAAAAAAA
``` 

- [ ] テストを動かして11ケースがPassしていることを確認

``` shell
yarn test
``` 

**上記でバックエンド側の接続確認は完了です！！
続いてフロントとの疎通を行ってください。**

## 参考URL

[ExpresとPostgresの疎通について](https://qiita.com/yusuke-ka/items/448843020c0406363ba5)

[ぐるなびAPI仕様について](https://api.gnavi.co.jp/api/manual/)
