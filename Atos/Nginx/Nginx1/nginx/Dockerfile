FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY proxy_params.conf /etc/nginx/proxy_params.conf

RUN mkdir -p /var/log/nginx

EXPOSE 80
