# coding:utf-8

import os

from celery import Celery
from flask import Flask, g, current_app
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.local import LocalProxy

from .core import db, mail, security, redis_cache, MySQLAlchemyUserDatastore
from .helpers import register_blueprints
from .model import User

_logger = LocalProxy(lambda: current_app.logger)


def create_app(package_name, package_path, setting_override=None, register_security_blueprint=True):
    app = Flask(package_name, instance_relative_config=True)

    app.config.from_object("program.settings")
    app.config.from_pyfile("config.py", silent=True)
    app.config.from_object(setting_override)

    db.init_app(app)
    if "PSYCOGREEN" in os.environ:
        with app.app_context():
            db.engine.pool._use_threadlocal = True

    mail.init_app(app)
    security.init_app(app, MySQLAlchemyUserDatastore(db, User), register_blueprint=register_security_blueprint)
    redis_cache.init_app(app)

    register_blueprints(app, package_name, package_path)

    @app.teardown_appcontext
    def shutdown_session(error=None):
        if error is None:
            try:
                db.session.commit()
            except SQLAlchemyError, e:
                db.session.rollback()
                _logger.exception(e)
                error = e
            else:
                callbacks = getattr(g, "on_commit_callbacks", ())
                for callback in callbacks:
                    try:
                        callback()
                    except Exception, e:
                        _logger.exception(e)

        else:
            db.session.rollback()
        db.session.remove()
        return error

    return app


def create_celery_app(app=None):
    app = app or create_app('program', os.path.dirname(__file__), register_security_blueprint=False)
    celery = Celery(__name__, broker=app.config["CELERY_BROKER_URL"])
    celery.conf.update(app.config)
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery
