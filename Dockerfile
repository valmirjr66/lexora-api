FROM node:22-alpine AS base

FROM base AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG COMMIT_REF
ENV COMMIT_REF=${COMMIT_REF}
ARG BUILD_DATE
ENV BUILD_DATE=${BUILD_DATE}

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY --from=build /usr/src/app/package-lock.json ./
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 8080
CMD [ "node", "dist/src/main.js" ]