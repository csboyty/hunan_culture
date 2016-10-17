# coding:utf-8

from flask import Blueprint, render_template, request, jsonify
from flask_security import login_required

from ..service import locationService

bp = Blueprint("location_admin", __name__, url_prefix="/admin/location")


@bp.route("/", methods=["GET"])
@login_required
def mgr():
    return render_template("backend/addressMgr.html")


@bp.route("/create", methods=["GET"])
@bp.route("/<int:location_id>/update", methods=["GET"])
def form(location_id=None):
    location = None
    if location_id:
        location = locationService.get_location_by_id(location_id)
    location = {} if location is None else location
    return render_template("backend/addressMgr.html", location=location)


@bp.route("/create_or_update", methods=['POST'])
@login_required
def create_or_update():
    location_id = request.form.get("location_id", None)
    name = request.form.get("name")
    province = request.form.get("province")
    city = request.form.get("city")
    description = request.form.get("description")
    longitude = float(request.form.get("longitude")) if request.form.get("longitude", None) else None
    latitude = float(request.form.get("latitude")) if request.form.get("latitude", None) else None

    if location_id:
        locationService.update_location(int(location_id), name, province, city, description, longitude, latitude)
    else:
        locationService.add_location(name, province, city, description, longitude, latitude)

    return jsonify(data=dict(success=True))


@bp.route("/<int:location_id>/delete", methods=["POST"])
@login_required
def delete(location_id):
    locationService.remove_location(location_id)
    return jsonify(data=dict(success=True))


@bp.route("/list", methods=["GET"])
@login_required
def data():
    limit = int(request.args.get("iDisplayLength", "10"))
    offset = int(request.args.get("iDisplayStart", "0"))
    sEcho = request.args.get("sEcho")
    search_content = request.args.get("search_content")
    count, locations = locationService.paginate(search_content, offset, limit)
    return jsonify(data=dict(success=True, sEcho=sEcho, iTotalRecords=count, iTotalDisplayRecords=count, aaData=locations))
