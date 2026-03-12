"""
Django settings for CivicGuard project.
AI-Powered Smart Government Grievance System
"""

from pathlib import Path
import os

# Try to load .env automatically (python-decouple or python-dotenv)
try:
    from decouple import config as env
except ImportError:
    # Fallback: read raw os.environ if decouple is not installed
    def env(key, default=None, cast=str):
        val = os.environ.get(key, default)
        if val is not None and cast is not str:
            try:
                return cast(val)
            except (ValueError, TypeError):
                return default
        return val

# ──────────────────────────────────────────────
# Base Paths
# ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ──────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────
SECRET_KEY = env('DJANGO_SECRET_KEY', default='django-insecure-)ar$sqhex3islci71qoo#sd*iig_2-nf7v@*9-f3rn@qpqfho(')

DEBUG = env('DEBUG', default=True, cast=lambda v: str(v).lower() not in ('false', '0', 'no'))

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# ──────────────────────────────────────────────
# Installed Applications
# ──────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Project apps
    'complaints',
    'admin_panel',
    'rest_framework_simplejwt',
    'django_filters',
]

# ──────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',          # CORS — must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Civic_Guard.urls'

# ──────────────────────────────────────────────
# Templates
# ──────────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Civic_Guard.wsgi.application'

# ──────────────────────────────────────────────
# Database — PostgreSQL
# Credentials are loaded from .env via python-decouple.
# ──────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     env('DB_NAME',     default='civic_guard_db'),
        'USER':     env('DB_USER',     default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default=''),
        'HOST':     env('DB_HOST',     default='localhost'),
        'PORT':     env('DB_PORT',     default='5432'),
    }
}

# ──────────────────────────────────────────────
# Password Validation
# ──────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ──────────────────────────────────────────────
# Internationalisation
# ──────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────
# Static & Media Files
# ──────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ──────────────────────────────────────────────
# Django REST Framework
# ──────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',   # Remove in production
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
    'DATE_FORMAT': '%Y-%m-%d',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
    },
}

# ──────────────────────────────────────────────
# JWT Settings (SimpleJWT)
# ──────────────────────────────────────────────
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ──────────────────────────────────────────────
# CORS Configuration
# ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',    # React dev server
    'http://localhost:5173',    # Vite dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]

CORS_ALLOW_CREDENTIALS = True   # Required for session-based auth from React

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ──────────────────────────────────────────────
# Session Configuration
# ──────────────────────────────────────────────
SESSION_COOKIE_AGE = 86400 * 7     # 7 days
SESSION_COOKIE_SAMESITE = 'Lax'    # Allow cross-origin session cookies (dev)
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# CSRF — allow React dev origins
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {module}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'complaints': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# ──────────────────────────────────────────────
# FastAPI Microservice URL
# ──────────────────────────────────────────────
FASTAPI_AI_SERVICE_URL = os.environ.get('FASTAPI_AI_SERVICE_URL', 'http://127.0.0.1:8001')

# ──────────────────────────────────────────────
# Admin Site Customisation
# ──────────────────────────────────────────────
ADMIN_SITE_HEADER = '🛡️ CivicGuard Administration'
ADMIN_SITE_TITLE  = 'CivicGuard Admin'
ADMIN_INDEX_TITLE = 'Government Grievance Management System'

# ──────────────────────────────────────────────
# Email / SMTP Configuration
# All credentials MUST be stored in .env — never hardcode them here.
# ──────────────────────────────────────────────

# Read SMTP credentials from environment / .env
_EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')

if _EMAIL_HOST_USER:
    # ── Production / real SMTP ──────────────────
    EMAIL_BACKEND    = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST       = env('EMAIL_HOST',       default='smtp.gmail.com')
    EMAIL_PORT       = env('EMAIL_PORT',       default=587, cast=int)
    EMAIL_USE_TLS    = env('EMAIL_USE_TLS',    default=True,  cast=lambda v: str(v).lower() not in ('false', '0', 'no'))
    EMAIL_USE_SSL    = env('EMAIL_USE_SSL',    default=False, cast=lambda v: str(v).lower() in ('true', '1', 'yes'))
    EMAIL_HOST_USER     = _EMAIL_HOST_USER
    EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
    DEFAULT_FROM_EMAIL  = env('DEFAULT_FROM_EMAIL', default=f'Civic Guard <{_EMAIL_HOST_USER}>')
else:
    # ── Development fallback — emails are printed to the console ────
    EMAIL_BACKEND   = 'django.core.mail.backends.console.EmailBackend'
    DEFAULT_FROM_EMAIL = 'Civic Guard <noreply@civicguard.local>'

