FROM node:18-alpine3.15
WORKDIR /app
COPY react/package.json /app/package.json
COPY react/package-lock.json /app/package-lock.json
COPY react/pnpm-lock.yaml /app/pnpm-lock.yaml
RUN npm install

COPY react/tsconfig.json /app/tsconfig.json
COPY react/src /app/src

run npm run build

CMD ["npm", "run", "start"]
