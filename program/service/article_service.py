# coding:utf-8

import sqlalchemy as sqla
import sqlalchemy_utils as sqla_utils
from flask import current_app
import geohash

from ..core import BaseService, redis_cache, db, after_commit
from ..model import Article, ArticleAsset, Tag, Location, Category
from .. import utils
from ..service import categoryService, locationService
from ..signals import article_add_signal, article_update_signal, article_remove_signal
from ..tasks import append_3d_asset, remove_3d_asset

article_asset_type_3d = 8


class ArticleService(BaseService):
    __model__ = Article

    @redis_cache.memoize()
    def get_article_by_id(self, article_id):
        article = self.get(article_id)
        if article:
            return utils.dotdict(
                article.asdict(include=Article.__dictfields__,
                               follow={"assets": {"only": ArticleAsset.__dictfields__}}))

    def add_article(self, title, description, profile, longitude, latitude, user_id, category_id, location_id,
                    content_type, assets):
        location = locationService.get_location_by_id(location_id)
        if location:
            article = Article()
            article.title = title
            article.description = description
            article.profile = profile
            article.longitude = longitude
            article.latitude = latitude
            article.geo_hash = geohash.encode(latitude, longitude, 9)
            article.user_id = user_id
            if category_id:
                article.category_id = category_id
            article.location_id = location_id
            article.content_type = content_type
            article.assets = assets
            self.save(article)
            article_add_signal.send(current_app._get_current_object(), article=article)
            self._handle_assets(assets_append=assets)
            return article

    def update_article(self, article_id, title, description, profile, longitude, latitude, user_id, category_id,
                       location_id, content_type, assets):
        article = self.get_or_404(article_id)
        location = locationService.get_location_by_id(location_id)

        article_cached = self.get_article_by_id(article_id)
        assets_cached_dict = dict(
            [(asset_dict['id'], utils.dotdict(asset_dict)) for asset_dict in article_cached.assets])
        assets_append = []
        assets_update = []

        for asset in assets:
            if asset.id is None:
                assets_append.append(asset)
            elif asset.id and asset.id in assets_cached_dict:
                assets_update.append((assets_cached_dict.pop(asset.id), asset))

        assets_remove = assets_cached_dict.values()

        if location:
            article.title = title
            article.description = description
            article.profile = profile
            article.longitude = longitude
            article.latitude = latitude
            article.geo_hash = geohash.encode(latitude, longitude, 9)
            article.user_id = user_id
            if category_id:
                article.category_id = category_id
            article.location_id = location_id
            article.content_type = content_type
            article.assets = assets
            self.save(article)
            article_update_signal.send(current_app._get_current_object(), article=article)
            self._handle_assets(assets_append=assets_append, assets_update=assets_update, assets_remove=assets_remove)
            return article

    def remove_article(self, article_id):
        article = self.get_or_404(article_id)
        article_cached = self.get_article_by_id(article_id)
        self.delete(article)
        article_remove_signal.send(current_app._get_current_object(), article_id=article_id,
                                   location_id=article.location_id)
        self._handle_assets(assets_remove=map(utils.dotdict, article_cached.assets))

    def paginate(self, search_content, content_type, offset, limit):
        if search_content:
            search_content = '%' + search_content + '%'
            filters = [sqla.or_(Article.title.like(search_content),
                                Article.location.has(sqla.or_(
                                    Location.name.like(search_content),
                                    Location.province.like(search_content),
                                    Location.city.like(search_content)
                                )))]
        else:
            filters = []

        if content_type:
            filters.append(Article.content_type == content_type)

        count, articles = self.paginate_by(filters=filters, orders=[Article.id.desc()], offset=offset, limit=limit)
        if articles:
            sqla_utils.batch_fetch(articles, Article.location, Article.category)
            articles = [article.asdict(include=Article.__dictfields__,
                                       follow={"location": {"only": Location.__dictfields__},
                                               "category": {"only": Category.__dictfields__}}) for article in articles]
        return count, articles

    @redis_cache.memoize()
    def article_count_by_keyword(self, keyword=None, content_type=0, category_name=None):
        filters = [Article.deleted == False]
        if keyword:
            filters.append(Article.location.has(
                sqla.or_(Location.name == keyword, Location.province == keyword, Location.city == keyword)
            ))
        if category_name:
            filters.append(Article.category.has(Category.name == category_name))
        if content_type:
            filters.append(Article.content_type == content_type)

        return Article.query.with_entities(db.func.count(Article.id)).filter(*filters).scalar()

    @redis_cache.memoize()
    def article_id_by_keyword(self, keyword=None, content_type=0, category_name=None, orders=[], offset=0, limit=10):
        filters = [not Article.deleted]
        if keyword:
            keyword = "%" + keyword + "%"
            filters.append(Article.location.has(
                sqla.or_(Location.name.like(keyword), Location.province.like(keyword), Location.city.like(keyword))
            ))
        if category_name:
            filters.append(Article.category.has(Category.name == category_name))
        if content_type:
            filters.append(Article.content_type == content_type)
        if not orders:
            orders = [Article.id.desc()]
        query = Article.query.with_entities(Article.id).filter(*filters).order_by(*orders)
        if offset:
            query = query.offset(offset)
        if limit:
            query = query.limit(limit)
        id_list = [id_ for (id_, ) in query.all()]
        return id_list

    @redis_cache.memoize()
    def article_id_by_geo(self, content_type=0, poi_longitude=None, poi_latitude=None, poi_distance=None):
        filters = [not Article.deleted]

        if content_type:
            filters.append(Article.content_type == content_type)

        if poi_longitude and poi_latitude and poi_distance:
            precision = utils.geo_precision_by_distance(poi_distance)
            poi_hash = geohash.encode(poi_latitude, poi_longitude, precision)
            poi_extend = geohash.expand(poi_hash)
            filters.append(sqla.or_(*[Article.geo_hash.like(poi_extend_hash + "%") for poi_extend_hash in poi_extend]))

        id_with_geo_list = Article.query.with_entities(Article.id, Article.latitude, Article.longitude). \
            filter(*filters).all()
        if poi_longitude and poi_latitude and poi_distance:
            temp_list = filter(
                lambda x: utils.get_distance_hav(poi_latitude, poi_longitude, x[1], x[2]) <= poi_distance,
                id_with_geo_list)
            id_list = [id_with_geo[0] for id_with_geo in temp_list]
        else:
            id_list = [id_with_geo[0] for id_with_geo in id_with_geo_list]
        return id_list

    def _handle_assets(self, assets_append=[], assets_update=[], assets_remove=[]):

        def do_handle_assets():
            for asset in assets_append:
                if asset.type == article_asset_type_3d:
                    append_3d_asset.delay(asset.id)

            for old_asset, new_asset in assets_update:
                if old_asset.type == article_asset_type_3d and new_asset.type != article_asset_type_3d:
                    remove_3d_asset.delay(old_asset.article_id, old_asset.id, old_asset.media_file)
                elif old_asset.type == article_asset_type_3d and new_asset.type == article_asset_type_3d \
                        and old_asset.media_file != new_asset.media_file:
                    remove_3d_asset.delay(old_asset.article_id, old_asset.id, old_asset.media_file)
                    append_3d_asset(new_asset.id)
                elif old_asset.type != article_asset_type_3d and new_asset.type == article_asset_type_3d:
                    append_3d_asset(new_asset.id)

            for asset in assets_remove:
                if asset.type == article_asset_type_3d:
                    remove_3d_asset.delay(asset.article_id, asset.id, asset.media_file)

        after_commit(do_handle_assets)

    def __repr__(self):
        return "{0}.{1}".format(self.__model__, self.__class__.__name__)


articleService = ArticleService()


def remove_cached_article(article_id):
    redis_cache.delete_memoized(articleService.get_article_by_id, article_id)


def remove_cached_article_count_by_keyword():
    redis_cache.delete_memoized(articleService.article_count_by_keyword)


def remove_cached_article_id_by_keyword():
    redis_cache.delete_memoized(articleService.article_id_by_keyword)


def remove_cached_article_id_by_geo():
    redis_cache.delete_memoized(articleService.article_id_by_geo)

