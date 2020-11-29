FROM node:12

WORKDIR /usr/src/app

# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
COPY package*.json ./

COPY RUN_ExceptBack.sh ./RUN_ExceptBack.sh

RUN yarn install

COPY . .

ENV PORT=3001
EXPOSE $PORT

# RUN npm install pm2 -g

# CMD ["pm2-runtime", "index.js"]

ENTRYPOINT ["/RUN_ExceptBack.sh"]
