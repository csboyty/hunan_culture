# coding:utf-8

import os
import logging
from logging.handlers import RotatingFileHandler
from werkzeug.local import LocalProxy
from flask import current_app, request, jsonify, render_template
from sqlalchemy.exc import DataError

from ..core import AppError
from ..settings import basedir
from ..helpers import JSONEncoder
from .. import factory

_logger = LocalProxy(lambda: current_app.logger)


def create_app(settings_override=None):
    app = factory.create_app(__name__, __path__, settings_override)

    log_file = os.path.join(basedir, "logs/error.log")
    if not os.path.exists(os.path.dirname(log_file)):
        os.mkdir(os.path.dirname(log_file))

    file_handler = RotatingFileHandler(log_file, 'a', 1 * 1024 * 1024, 10)
    file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s:%(message)s [in %(pathname)s:%(lineno)d]'))
    file_handler.setLevel(logging.WARNING)
    app.logger.addHandler(file_handler)

    app.json_encoder = JSONEncoder

    @app.context_processor
    def utility_processor():

        def contains(item, array):
            if item in array:
                return True
            else:
                return False

        def filename(filepath):
            if filepath:
                return filepath.rsplit('/', 1)[-1]
            else:
                return ""

        return dict(contains=contains, filename=filename)

    app.errorhandler(DataError)(on_data_error)
    app.errorhandler(AppError)(on_app_error)
    app.errorhandler(404)(on_404)
    app.errorhandler(500)(on_500)

    return app


def on_data_error(e):
    if json_required():
        return jsonify(data=dict(success=False, error_code="DATA_ERROR"))
    else:
        return render_template("backend/error/500.html", error=e)


def on_app_error(e):
    if json_required():
        return jsonify(data=dict(success=False, error_code=e.code))
    else:
        return render_template("backend/error/500.html", error=e)


def on_404(e):
    if json_required():
        return jsonify(data=dict(success=False, error_code="NOT_FOUND"))
    else:
        return render_template("backend/error/404.html")


def on_500(e):
    _logger.exception(e)
    if json_required():
        return jsonify(data=dict(success=False, error_code="INTERNAL_ERROR"))
    else:
        return render_template("backend/error/500.html")


def json_required():
    if "application/json" in request.headers.get("content-type", "") or "xmlhttprequest" == request.headers.get(
            "X-Requested-With", "").lower():
        return True
    else:
        return False


