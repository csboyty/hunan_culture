# coding:utf-8

SECRET_KEY = "hunan_culture_secret"

SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://zzy:zzy@localhost:6432/hunan_culture_db"
SQLALCHEMY_ECHO = True

CELERY_BROKER_URL = "redis://localhost:6379/4"

SECURITY_PASSWORD_HASH = "sha256_crypt"
SECURITY_PASSWORD_SALT = "password_salt"
SECURITY_REMEMBER_SALT = "remember_salt"
SECURITY_RESET_SALT = "rest_salt"

CACHE_REDIS_HOST = "localhost"
CACHE_REDIS_PORT = 6379
CACHE_KEY_PREFIX = "hnc:"
CACHE_REDIS_DB = 3
CACHE_DEFAULT_TIMEOUT = 1800
