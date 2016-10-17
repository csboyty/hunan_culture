# coding:utf-8

import functools
import blinker
from core import after_commit


_signals = blinker.Namespace()

location_add_signal = _signals.signal("location_add")
location_update_signal = _signals.signal("location_update")
location_remove_signal = _signals.signal("location_remove")
article_add_signal = _signals.signal("article_add")
article_update_signal = _signals.signal("article_update")
article_remove_signal = _signals.signal("article_remove")
article_asset_update_signal = _signals.signal("article_asset_update")


@location_add_signal.connect
def _on_location_add(app, location=None):
    from service import remove_cached_all_location_names, remove_cached_location_id_by_geo

    after_commit(remove_cached_all_location_names)
    after_commit(remove_cached_location_id_by_geo)


@location_update_signal.connect
def _on_location_update(app, location=None):
    from service import remove_cached_location
    from service import remove_cached_all_location_names, remove_cached_location_id_by_geo, \
        remove_cached_article_count_by_keyword, remove_cached_article_id_by_keyword, remove_cached_article_id_by_geo

    after_commit(functools.partial(remove_cached_location, location.id))
    after_commit(remove_cached_all_location_names)
    after_commit(remove_cached_location_id_by_geo)
    after_commit(remove_cached_article_count_by_keyword)
    after_commit(remove_cached_article_id_by_keyword)
    after_commit(remove_cached_article_id_by_geo)


@location_remove_signal.connect
def _on_location_remove(app, location_id=None):
    from service import remove_cached_location
    from service import remove_cached_all_location_names, remove_cached_location_id_by_geo, \
        remove_cached_article_count_by_keyword, remove_cached_article_id_by_keyword, remove_cached_article_id_by_geo

    after_commit(functools.partial(remove_cached_location, location_id))
    after_commit(remove_cached_location_id_by_geo)
    after_commit(remove_cached_all_location_names)
    after_commit(remove_cached_article_count_by_keyword)
    after_commit(remove_cached_article_id_by_keyword)
    after_commit(remove_cached_article_id_by_geo)


@article_add_signal.connect
def _on_article_add(app, article=None):
    from service import remove_cached_location
    from service import remove_cached_all_location_names, remove_cached_article_count_by_keyword, \
        remove_cached_article_id_by_keyword, remove_cached_article_id_by_geo

    after_commit(remove_cached_all_location_names)
    after_commit(functools.partial(remove_cached_location, article.location_id))
    after_commit(remove_cached_article_count_by_keyword)
    after_commit(remove_cached_article_id_by_keyword)
    after_commit(remove_cached_article_id_by_geo)


@article_update_signal.connect
def _on_article_update(app, article=None):
    from service import remove_cached_article
    from service import remove_cached_location
    from service import remove_cached_all_location_names, remove_cached_article_count_by_keyword, \
        remove_cached_article_id_by_keyword, remove_cached_article_id_by_geo

    after_commit(functools.partial(remove_cached_article, article.id))
    after_commit(functools.partial(remove_cached_location, article.location_id))
    after_commit(remove_cached_all_location_names)
    after_commit(remove_cached_article_count_by_keyword)
    after_commit(remove_cached_article_id_by_keyword)
    after_commit(remove_cached_article_id_by_geo)


@article_remove_signal.connect
def _on_article_remove(app, article_id=None, location_id=None):
    from service import remove_cached_article
    from service import remove_cached_location
    from service import remove_cached_all_location_names, remove_cached_article_count_by_keyword, \
        remove_cached_article_id_by_keyword, remove_cached_article_id_by_geo

    after_commit(functools.partial(remove_cached_article, article_id))
    after_commit(functools.partial(remove_cached_location, location_id))
    after_commit(remove_cached_all_location_names)
    after_commit(remove_cached_article_count_by_keyword)
    after_commit(remove_cached_article_id_by_keyword)
    after_commit(remove_cached_article_id_by_geo)


@article_asset_update_signal.connect
def _on_article_asset_update(app, article_id=None):
    from service import remove_cached_article

    after_commit(functools.partial(remove_cached_article, article_id))