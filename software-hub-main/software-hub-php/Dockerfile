FROM php:8.3-apache

ENV APACHE_DOCUMENT_ROOT /var/www/html

RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo_mysql zip gd \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY . /var/www/html

RUN chown -R www-data:www-data /var/www/html \
    && mkdir -p /var/lib/php/sessions \
    && chown www-data:www-data /var/lib/php/sessions

# Production-like PHP settings
RUN { \
  echo "display_errors=0"; \
  echo "log_errors=1"; \
  echo "error_log=/var/log/php_errors.log"; \
} > /usr/local/etc/php/conf.d/php-production.ini

EXPOSE 80

