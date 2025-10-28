FROM node:22-alpine AS development

WORKDIR /eng-center/client

COPY package*.json ./

RUN npm ci
COPY . /eng-center/client

RUN npm run build

ENV CI=true
ENV PORT=3000

# Accept build argument
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

FROM development AS build

RUN npm run build

FROM nginx:alpine

COPY --from=build /eng-center/client/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /eng-center/client/dist .

EXPOSE 3000

ENTRYPOINT ["nginx", "-g", "daemon off;"]