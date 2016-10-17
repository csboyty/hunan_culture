# coding:utf-8

from flask import Blueprint, request, jsonify, render_template

from ..service import articleService, locationService
from ..results import multi_article_result
from ..helpers import crossdomain

bp = Blueprint('article_user', __name__, url_prefix="/articles")


@bp.route("/keywords", methods=["GET"])
@crossdomain(origin="*")
def article_keywords():
    location_names = locationService.all_location_names()
    return jsonify(data=dict(success=True, keywords=location_names))


@bp.route("/search_by_keyword", methods=["GET"])
@crossdomain(origin="*")
def search_article_by_keyword():
    keyword = request.args.get("keyword")
    category_name = request.args.get("category", "")
    limit = int(request.args.get("limit")) if request.args.get("limit") else None
    offset = int(request.args.get("offset", "0"))
    article_id_list = articleService. \
        article_id_by_keyword(keyword=keyword, category_name=category_name, offset=offset, limit=limit)
    article_list = multi_article_result(article_id_list, with_location=True)
    return jsonify(data=dict(articles=article_list, success=True))


@bp.route("/search_by_geo", methods=["GET"])
@crossdomain(origin="*")
def search_article_by_geo():
    poi_longitude = float(request.args.get("longitude")) if request.args.get("longitude") else None
    poi_latitude = float(request.args.get("latitude")) if request.args.get("latitude") else None
    poi_distance = float(request.args.get("distance")) if request.args.get("distance") else None
    article_id_list = articleService. \
        article_id_by_geo(poi_longitude=poi_longitude, poi_latitude=poi_latitude, poi_distance=poi_distance)

    article_list = multi_article_result(article_id_list, with_location=True)
    return jsonify(data=dict(articles=article_list, success=True))


@bp.route("/<int:article_id>", methods=["GET"])
@crossdomain(origin="*")
def show_article(article_id):
    article = articleService.get_article_by_id(article_id)
    return jsonify(data=dict(article=article, success=True))

@bp.route("/<int:article_id>/detail", methods=["GET"])
def show_article_page(article_id):
    article = articleService.get_article_by_id(article_id)
    return render_template('article_detail.html', article=article)










