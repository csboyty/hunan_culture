# coding:utf-8

from flask import Blueprint, render_template, request, jsonify
from flask_security import login_required

from ..service import categoryService
from ..model import Category

bp = Blueprint("category_admin", __name__, url_prefix="/admin/category")


@bp.route('/', methods=["GET"])
def mgr():
    return render_template("backend/categoriesMgr.html")


@bp.route("/create", methods=["POST"])
def create():
    name = request.form.get("name")
    categoryService.add_category(name)
    return jsonify(data=dict(success=True))


@bp.route("/list", methods=["GET"])
@login_required
def data():
    sEcho = request.args.get("sEcho")
    categories = categoryService.all_categories()
    return jsonify(
        data=dict(success=True, sEcho=sEcho, iTotalRecords=len(categories), iTotalDisplayRecords=len(categories),
                  aaData=categories))


