# coding:utf-8

from ..core import BaseService, redis_cache
from ..model import Category
from ..utils import dotdict


class CategoryService(BaseService):
    __model__ = Category

    @redis_cache.memoize()
    def get_category_by_id(self, category_id):
        category = self.get(category_id)
        if category:
            return dotdict(category.asdict(only=Category.__dictfields__))

    @redis_cache.memoize()
    def get_category_by_name(self, category_name):
        category = Category.query.filter(Category.name == category_name).first()
        if category:
            return dotdict(category.asdict(only=Category.__dictfields__))

    def add_category(self, name):
        category = Category(name=name)
        self.save(category)

    def all_categories(self):
        categories = self.get_all(orders=[Category.name.asc()])
        return [category.asdict(only=Category.__dictfields__) for category in categories]

    def __repr__(self):
        return "{0}.{1}".format(self.__model__, self.__class__.__name__)


categoryService = CategoryService()