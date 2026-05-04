from .settings import *
import dj_database_url

DEBUG = False

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['cyphex-dialer.com'])

# Security Settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database
# Use dj_database_url to parse the DATABASE_URL environment variable
DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL', default='postgres://user:password@db:5432/cyphex_db')
    )
}

# Static/Media for production
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS for production
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['https://cyphex-dialer.com'])
