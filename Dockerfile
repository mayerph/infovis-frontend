FROM node:alpine as app

WORKDIR /app

COPY . /app/.

RUN npm install
ENTRYPOINT ["npm", "run", "starter"]

EXPOSE 8000