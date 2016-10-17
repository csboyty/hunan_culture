# coding:utf-8

import sqlalchemy as sqla
from sqlalchemy_utils.models import Timestamp
from ..core import db, Deleted


article_tag_table = db.Table("article_tag", db.Model.metadata,
                             db.Column("article_id", db.Integer, db.ForeignKey("article.id", ondelete="cascade"),
                                       primary_key=True),
                             db.Column('tag_id', db.Integer, db.ForeignKey("tag.id", ondelete="cascade"),
                                       primary_key=True)
)


class Tag(db.Model):
    __tablename__ = "tag"
    __dictfields__ = ["id", "name"]

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.Unicode(64), unique=True, nullable=False)

    def __eq__(self, other):
        return self.name == other or self.name == getattr(other, "name", None)

    def __ne__(self, other):
        return not self.__eq__(other)

    def __repr__(self):
        return "{0}.{1}({2})".format(self.__module__, self.__class__.__name__, self.id)


class Location(db.Model, Deleted, Timestamp):
    __tablename__ = "location"
    __dictfields__ = ["id", "name", "description", "longitude", "latitude", "geo_hash", "province", "city",
                      "article_count", "article_count_group_by_category"]

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.Unicode(32), nullable=False)
    province = db.Column(db.Unicode(12), nullable=True)
    city = db.Column(db.Unicode(24), nullable=False)
    description = db.Column(db.Text(), nullable=True)
    longitude = db.Column(db.Numeric(precision=8, scale=5), nullable=True)
    latitude = db.Column(db.Numeric(precision=7, scale=5), nullable=True)
    geo_hash = db.Column(db.String(9), nullable=True)
    _version_id = db.Column(db.Integer(), nullable=False)

    __mapper_args__ = {
        "version_id_col": _version_id
    }

    @property
    def article_count(self):
        return self.article_query.with_entities(db.func.count("id")).filter(Article.deleted == False).scalar()

    @property
    def article_count_group_by_category(self):
        location_article_by_category = db.session.query(
            Category.name, sqla.sql.label('article_count', db.func.count(Article.id))) \
            .select_from(Category) \
            .outerjoin(Article, sqla.and_(Category.id == Article.category_id, Article.location_id == self.id,
                                          Article.deleted == False)) \
            .group_by(Category.name).all()
        return dict(location_article_by_category)

    def __eq__(self, other):
        if isinstance(other, Location) and self.id == getattr(other, 'id'):
            return True
        else:
            return False

    def __ne__(self, other):
        return not self.__eq__(other)

    def __repr__(self):
        return "{0}.{1}({2})".format(self.__module__, self.__class__.__name__, self.id)


class Category(db.Model):
    __tablename__ = "category"
    __dictfields__ = ["id", "name"]

    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.Unicode(32), unique=True, nullable=False)

    def __eq__(self, other):
        return self.name == other or self.name == getattr(other, "name", None)

    def __ne__(self, other):
        return not self.__eq__(other)

    def __repr__(self):
        return "{0}.{1}({2})".format(self.__module__, self.__class__.__name__, self.id)


class Article(db.Model, Deleted, Timestamp):
    __tablename__ = "article"
    __dictfields__ = ["id", "title", "description", "longitude", "latitude", "geo_hash", "profile", "category_id",
                      "content_type", "location_id"]

    id = db.Column(db.Integer(), primary_key=True)
    title = db.Column(db.Unicode(64), nullable=False)
    description = db.Column(db.Text(), nullable=False)
    longitude = db.Column(db.Numeric(precision=8, scale=5), nullable=False)
    latitude = db.Column(db.Numeric(precision=7, scale=5), nullable=False)
    geo_hash = db.Column(db.String(9), nullable=False)
    profile = db.Column(db.Unicode(256), nullable=False)
    content_type = db.Column(db.SmallInteger(), nullable=False, default=1)

    user_id = db.Column(db.Integer(), db.ForeignKey("user.id"))
    user = db.relationship("User", uselist=False, backref=db.backref("articles", lazy="dynamic"))
    category_id = db.Column(db.Integer(), db.ForeignKey("category.id"), nullable=True)
    category = db.relationship("Category", uselist=False, backref=db.backref("article_query", lazy="dynamic"))
    location_id = db.Column(db.Integer(), db.ForeignKey("location.id", ondelete="cascade"))
    location = db.relationship("Location", uselist=False, backref=db.backref("article_query", lazy="dynamic"))
    assets = db.relationship("ArticleAsset", order_by="asc(ArticleAsset.pos)", passive_deletes=True,
                             cascade="all,delete-orphan")
    _tags = db.relationship("Tag", secondary=article_tag_table, passive_deletes=True, backref="articles")

    _version_id = db.Column(db.Integer(), nullable=False)

    __mapper_args__ = {
        'polymorphic_identity': 1,
        'polymorphic_on': content_type,
        "version_id_col": _version_id
    }

    @property
    def tags_name(self):
        return [_tag.name for _tag in self._tags]

    @tags_name.setter
    def tags_name(self, value):
        value = set(value)
        tags = Tag.query.filter(Tag.name.in_(value)).all()
        for tag_name in value:
            if tag_name not in tags:
                tags.append(Tag(name=tag_name))
        self._tags = tags

    def __eq__(self, other):
        if isinstance(other, Article) and self.id == getattr(other, 'id'):
            return True
        else:
            return False

    def __ne__(self, other):
        return not self.__eq__(other)

    def __repr__(self):
        return "{0}.{1}({2})".format(self.__module__, self.__class__.__name__, self.id)


class ArticleAsset(db.Model, Timestamp):
    __tablename__ = "article_asset"
    __dictfields__ = ["id", "article_id", "type", "pos", "name", "description", "profile_filename", "profile_file",
                      "media_filename", "media_file", "view_url"]

    id = db.Column(db.Integer(), primary_key=True)
    article_id = db.Column(db.Integer(), db.ForeignKey("article.id", ondelete='cascade'))
    type = db.Column(db.SmallInteger(), nullable=False, default=1)
    pos = db.Column(db.SmallInteger(), nullable=False)
    name = db.Column(db.Unicode(128), nullable=False)
    description = db.Column(db.Text())
    profile_filename = db.Column(db.Unicode(128), nullable=False)
    profile_file = db.Column(db.Unicode(256), nullable=False)
    media_filename = db.Column(db.Unicode(128), nullable=True)
    media_file = db.Column(db.Unicode(256), nullable=True)
    view_url = db.Column(db.Unicode(512), nullable=True)

    def __eq__(self, other):
        if isinstance(other, ArticleAsset) and self.id == getattr(other, 'id'):
            return True
        else:
            return False

    def __ne__(self, other):
        return not self.__eq__(other)

    def __repr__(self):
        return "{0}.{1}({2})".format(self.__module__, self.__class__.__name__, self.id)


class ArticleVideo(Article):
    __tablename__ = 'article_video'

    id = db.Column(db.Integer(), db.ForeignKey('article.id', ondelete='cascade'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': 2
    }


class ArticleMusic(Article):
    __tablename__ = 'article_music'

    id = db.Column(db.Integer(), db.ForeignKey('article.id', ondelete='cascade'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': 3
    }