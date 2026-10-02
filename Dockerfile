FROM node:22-alpine AS build

WORKDIR /zootech-frontend

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG FRONTEND_BUILD_ENV
ENV FRONTEND_BUILD_ENV=$FRONTEND_BUILD_ENV

RUN pnpm run build:${FRONTEND_BUILD_ENV}

FROM nginx:alpine AS production

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /zootech-frontend/dist/zootech/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx" , "-g" , "daemon off;"]