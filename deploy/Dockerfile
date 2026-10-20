# The site, built and served by nginx, which also passes /api and /files on to the ERP, so the site
# reads the showroom's cars from the ERP on its own address (no CORS):
#
#   docker build -f deploy/Dockerfile -t automodiran-site .
#   docker run -d --name automodiran-site -p 80:80 -e ERP=http://host.docker.internal:8080 automodiran-site
#
# ERP: where the ERP answers. ERP_HOST: which of its business environments has the showroom
# (localhost for its main site, or e.g. automodiran.localhost when it is a business of its own).
FROM node:22-alpine AS build
WORKDIR /site
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV ERP=http://host.docker.internal:8080 ERP_HOST=localhost
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /site/dist /usr/share/nginx/html
