# coding:utf-8

from flask import Blueprint, request, jsonify

from ..service import locationService
from ..results import multi_location_result
from ..helpers import crossdomain

bp = Blueprint('location_user', __name__, url_prefix="/locations")


@bp.route("/search_by_geo", methods=["GET"])
@crossdomain(origin="*")
def search_article_by_geo():
    poi_longitude = float(request.args.get("longitude")) if request.args.get("longitude") else None
    poi_latitude = float(request.args.get("latitude")) if request.args.get("latitude") else None
    poi_distance = float(request.args.get("distance")) if request.args.get("distance") else None
    location_id_list = locationService. \
        location_id_by_geo(poi_longitude=poi_longitude, poi_latitude=poi_latitude, poi_distance=poi_distance)

    location_list = multi_location_result(location_id_list)
    return jsonify(data=dict(locations=location_list, success=True))