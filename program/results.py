# coding:utf-8

from service import articleService, locationService, categoryService


def article_result(article_id, with_location=False):
    article = articleService.get_article_by_id(article_id)
    if 'category_id' in article:
        article.update(category=categoryService.get_category_by_id(article.pop("category_id")))
    if with_location:
        location = locationService.get_location_by_id(article.pop("location_id"))
        article.update(location=location)
    return article


def multi_article_result(article_id_list, with_location=False):
    articles = [article_result(article_id, with_location) for article_id in article_id_list]
    return articles


def location_result(location_id):
    location = locationService.get_location_by_id(location_id)
    return location


def multi_location_result(location_id_list):
    locations = [locationService.get_location_by_id(location_id) for location_id in location_id_list]
    return locations


