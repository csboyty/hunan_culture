# coding:utf-8

from ..core import BaseService, redis_cache
from ..model import Tag
from ..utils import dotdict


class TagService(BaseService):
    __model__ = Tag

    @redis_cache.memoize()
    def get_tag_by_id(self, tag_id):
        tag = self.get_by_id(tag_id)
        if tag:
            return dotdict(tag.asdict(only=Tag.__dictfields__))

    @redis_cache.memoize()
    def get_tag_by_name(self, tag_name):
        tag = Tag.query.filter(Tag.name == tag_name).first()
        if tag:
            return dotdict(tag.asdict(only=Tag.__dictfields__))

    def add_tag(self, name):
        tag = Tag(name=name)
        return self.save(tag)

    def __repr__(self):
        return "{0}.{1}".format(self.__model__, self.__class__.__name__)

tagService = TagService()