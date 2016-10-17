# coding:utf-8

from flask import Blueprint, render_template, request, jsonify, json
from flask_security import login_required, current_user

from ..service import articleService, locationService, categoryService
from ..model import ArticleAsset

bp = Blueprint('article_admin', __name__, url_prefix="/admin/article")


@bp.route("/", methods=["GET"])
@login_required
def article_mgr():
    return render_template("backend/postsMgr.html")


@bp.route("/create", methods=['GET'])
@bp.route("/<int:article_id>/update", methods=["GET"])
@login_required
def article_form(article_id=None):
    locations = locationService.get_all()
    categories = categoryService.get_all()
    article = None
    if article_id:
        article = articleService.get_article_by_id(article_id)
    article = {} if article is None else article
    return render_template("backend/postsUpdate.html", article=article, locations=locations, categories=categories)


@bp.route("/article_video", methods=["GET"])
@login_required
def article_video_mgr():
    return render_template("backend/videosMgr.html")


@bp.route("/article_video/create", methods=['GET'])
@bp.route("/article_video/<int:article_id>/update", methods=["GET"])
@login_required
def article_video_form(article_id=None):
    locations = locationService.get_all()
    article = None
    if article_id:
        article = articleService.get_article_by_id(article_id)
    article = {} if article is None else article
    return render_template("backend/videosUpdate.html", article=article, locations=locations)


@bp.route("/article_music", methods=["GET"])
@login_required
def article_music_mgr():
    return render_template("backend/musicsMgr.html")


@bp.route("/article_music/create", methods=['GET'])
@bp.route("/article_music/<int:article_id>/update", methods=["GET"])
@login_required
def article_music_form(article_id=None):
    locations = locationService.get_all()
    article = None
    if article_id:
        article = articleService.get_article_by_id(article_id)
    article = {} if article is None else article
    return render_template("backend/musicsUpdate.html", article=article, locations=locations)


@bp.route("/create_or_update", methods=['POST'])
@login_required
def create_or_update():
    article_id = request.form.get("article_id", None)
    title = request.form.get("title")
    description = request.form.get("description")
    profile = request.form.get("profile")
    longitude = float(request.form.get("longitude"))
    latitude = float(request.form.get("latitude"))
    user_id = current_user.id
    content_type = int(request.form.get("content_type")) if request.form.get("content_type", None) else None
    category_id = int(request.form.get("category_id")) if request.form.get("category_id", None) else None
    location_id = int(request.form.get("location_id"))
    assets = map(lambda asset_dict: ArticleAsset(**asset_dict), json.loads(request.form.get("assets")))

    if article_id:
        articleService.update_article(int(article_id), title, description, profile, longitude, latitude, user_id,
                                      category_id, location_id, content_type, assets)
    else:
        articleService.add_article(title, description, profile, longitude, latitude, user_id, category_id, location_id,
                                   content_type, assets)
    return jsonify(data=dict(success=True))


@bp.route("/<int:article_id>/assets", methods=['GET'])
@login_required
def load_assets(article_id):
    article = articleService.get_article_by_id(article_id)
    if article:
        assets = article.assets
    else:
        assets = []
    return jsonify(data=dict(success=True, assets=assets))


@bp.route("/<int:article_id>/delete", methods=['POST'])
@login_required
def delete(article_id):
    articleService.remove_article(article_id)
    return jsonify(data=dict(success=True))


@bp.route("/list", methods=["GET"])
@login_required
def data():
    limit = int(request.args.get("iDisplayLength", "10"))
    offset = int(request.args.get("iDisplayStart", "0"))
    sEcho = request.args.get("sEcho")
    search_content = request.args.get("search_content")
    content_type = int(request.args.get("content_type")) if request.args.get("content_type", None) else None
    count, articles = articleService.paginate(search_content, content_type, offset, limit)
    return jsonify(
        data=dict(success=True, sEcho=sEcho, iTotalRecords=count, iTotalDisplayRecords=count, aaData=articles))




