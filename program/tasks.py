# coding:utf-8

import requests
import os
import shutil
from werkzeug.local import LocalProxy
from flask import current_app

from . import settings
from . import qinius
from .factory import create_celery_app
from .utils import unzip
from .model import ArticleAsset
from .signals import article_asset_update_signal

celery = create_celery_app()

_logger = LocalProxy(lambda: current_app.logger)


@celery.task
def append_3d_asset(article_asset_id):
    try:
        article_asset = ArticleAsset.query.get(article_asset_id)
        local_filename = os.path.join(settings.tmp_dir, article_asset.media_file.split('/')[-1])
        r = requests.get(article_asset.media_file, stream=True)
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
                    f.flush()

        dest_dir = os.path.join(settings.qiniu_hnc_pkg_sync_dir, str(article_asset.article_id), str(article_asset_id))
        print('dest_dir,', dest_dir)
        if local_filename.endswith('zip'):
            unzip(local_filename, dest_dir)
            os.remove(local_filename)
        dir_name = os.listdir(dest_dir)[0]
        print settings.qiniu_hnc_pkg_prefix
        article_asset.view_url = '/'.join(s.strip('/') for s in [settings.qiniu_hnc_pkg_prefix,
                                                                 dest_dir[len(settings.qiniu_hnc_pkg_sync_dir):],
                                                                 dir_name, "index.html"])
        article_asset_update_signal.send(current_app._get_current_object(), article_id=article_asset.article_id)
    except Exception as e:
        _logger.exception(e)


@celery.task
def remove_3d_asset(article_id, asset_id, asset_media_file):
    try:
        dest_dir = os.path.join(settings.qiniu_hnc_pkg_sync_dir, str(article_id), str(asset_id))
        shutil.rmtree(dest_dir, ignore_errors=True)
        qinius.rm_key(asset_media_file)
    except Exception as e:
        _logger.exception(e)