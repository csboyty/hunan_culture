# coding:utf-8

import sqlalchemy as sqla
from flask import current_app
import geohash

from ..signals import location_add_signal, location_update_signal, location_remove_signal
from ..core import BaseService, redis_cache
from ..model import Location, Tag
from .. import utils


class LocationService(BaseService):
    __model__ = Location

    @redis_cache.memoize()
    def get_location_by_id(self, location_id):
        location = self.get(location_id)
        if location:
            return utils.dotdict(location.asdict(only=Location.__dictfields__))

    def add_location(self, name, province, city, description, longitude, latitude):
        location = Location()
        location.name = name
        location.province = province
        location.city = city
        location.description = description
        location.longitude = longitude
        location.latitude = latitude
        if longitude and latitude:
            location.geo_hash = geohash.encode(latitude, longitude, 9)
        self.save(location)
        location_add_signal.send(current_app._get_current_object(), location=location)
        return location

    def update_location(self, location_id, name, province, city, description, longitude, latitude):
        location = self.get_or_404(location_id)
        location.name = name
        location.province = province
        location.city = city
        location.description = description
        location.longitude = longitude
        location.latitude = latitude
        if longitude and latitude:
            location.geo_hash = geohash.encode(latitude, longitude, 9)
        self.save(location)
        location_update_signal.send(current_app._get_current_object(), location=location)

    def remove_location(self, location_id):
        location = self.get_or_404(location_id)
        self.delete(location)
        location_remove_signal.send(current_app._get_current_object(), location_id=location_id)

    def paginate(self, search_content, offset, limit):
        if search_content:
            search_content = '%' + search_content + '%'
            filters = [sqla.or_(Location.name.like(search_content), Location.province.like(search_content),
                                Location.city.like(search_content))]
        else:
            filters = []
        count, locations = self.paginate_by(filters=filters, orders=[Location.id.asc()], offset=offset, limit=limit)
        if locations:
            locations = [location.asdict(only=Location.__dictfields__) for location in locations]
        return count, locations

    @redis_cache.memoize()
    def all_location_names(self):
        location_list = Location.query.with_entities(Location.name, Location.province, Location.city).filter(
            not Location.deleted).all()
        location_name_set = set()
        for loc in location_list:
            location_name_set.add(loc[0])
            location_name_set.add(loc[1])
            location_name_set.add(loc[2])
        return list(location_name_set)

    @redis_cache.memoize()
    def location_id_by_geo(self, poi_longitude=None, poi_latitude=None, poi_distance=None):
        filters = [Location.deleted == False]
        if poi_longitude and poi_latitude and poi_distance:
            precision = utils.geo_precision_by_distance(poi_distance)
            poi_hash = geohash.encode(poi_latitude, poi_longitude, precision)
            poi_extend = geohash.expand(poi_hash)
            filters.append(sqla.or_(*[Location.geo_hash.like(poi_extend_hash + "%") for poi_extend_hash in poi_extend]))

        id_with_geo_list = Location.query.with_entities(Location.id, Location.latitude, Location.longitude). \
            filter(*filters).all()
        if poi_longitude and poi_latitude and poi_distance:
            temp_list = filter(
                lambda x: utils.get_distance_hav(poi_latitude, poi_longitude, x[1], x[2]) <= poi_distance,
                id_with_geo_list)
            id_list = [id_with_geo[0] for id_with_geo in temp_list]
        else:
            id_list = [id_with_geo[0] for id_with_geo in id_with_geo_list]

        return id_list

    def __repr__(self):
        return "{0}.{1}".format(self.__model__, self.__class__.__name__)


locationService = LocationService()


def remove_cached_location(location_id):
    redis_cache.delete_memoized(locationService.get_location_by_id, location_id)


def remove_cached_all_location_names():
    redis_cache.delete_memoized(locationService.all_location_names)


def remove_cached_location_id_by_geo():
    redis_cache.delete_memoized(locationService.location_id_by_geo)

