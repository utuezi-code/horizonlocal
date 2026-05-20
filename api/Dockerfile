FROM php:8.4-fpm-alpine AS base

# System deps + build tools for PECL
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libzip-dev \
    zip unzip \
    icu-dev \
    oniguruma-dev \
    redis \
    bash \
    curl \
 && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    autoconf \
    gcc \
    g++ \
    make \
    linux-headers

# PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql zip intl bcmath opcache pcntl \
 && pecl install redis \
 && docker-php-ext-enable redis \
 && apk del .build-deps

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP deps first (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

# Copy app
COPY . .

# Create required directories BEFORE composer scripts (package:discover needs bootstrap/cache)
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache \
 && composer dump-autoload --optimize

# Nginx config
RUN echo 'server { \
    listen 8080 default_server; \
    root /var/www/html/public; \
    index index.php; \
    location / { try_files $uri $uri/ /index.php?$query_string; } \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_index index.php; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
    } \
}' > /etc/nginx/http.d/default.conf

# Supervisord runs nginx + php-fpm + queue worker
RUN printf '[supervisord]\nnodaemon=true\nuser=root\n\n\
[program:php-fpm]\ncommand=php-fpm\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0\n\n\
[program:nginx]\ncommand=nginx -g "daemon off;"\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0\n\n\
[program:queue]\ncommand=php /var/www/html/artisan queue:work --tries=3 --timeout=120\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstdout_logfile_maxbytes=0\nstderr_logfile=/dev/stderr\nstderr_logfile_maxbytes=0\n\n\
[program:scheduler]\ncommand=sh -c "while true; do php /var/www/html/artisan schedule:run --no-interaction >> /dev/null 2>&1; sleep 60; done"\nautostart=true\nautorestart=true\n' > /etc/supervisord.conf

# Entrypoint runs migrations then starts supervisord
RUN printf '#!/bin/sh\nset -e\necho "Running migrations..."\nphp artisan migrate --force || true\necho "Caching config..."\nphp artisan config:cache || true\nphp artisan route:cache || true\nexec supervisord -c /etc/supervisord.conf\n' > /entrypoint.sh \
 && chmod +x /entrypoint.sh

EXPOSE 8080
CMD ["/entrypoint.sh"]
