# coding:utf-8

from flask import Blueprint, jsonify
from flask_security import login_required
from .. import qinius


bp = Blueprint("qiniu", __name__, url_prefix="/qiniu")


@bp.route("/uptoken", methods=["GET"])
@login_required
def get_upload_token():
    up_token = qinius.upload_token()
    return jsonify(data=dict(success=True, uptoken=up_token))