# coding:utf-8


import zipfile
import cchardet
import os

from math import sin, asin, cos, radians, fabs, sqrt

EARTH_RADIUS = 6371000


def hav(theta):
    s = sin(theta / 2)
    return s * s


def get_distance_hav(lat0, lng0, lat1, lng1):
    """ use haversine formula to calculate the distance """
    lat0 = radians(lat0)
    lat1 = radians(lat1)
    lng0 = radians(lng0)
    lng1 = radians(lng1)

    dlat = fabs(lat0 - lat1)
    dlng = fabs(lng0 - lng1)
    h = hav(dlat) + cos(lat0) * cos(lat1) * hav(dlng)
    distance = 2 * EARTH_RADIUS * asin(sqrt(h))
    return distance


def geo_precision_by_distance(distance):
    if distance < 19:
        precision = 8
    elif 19 < distance <= 76:
        precision = 7
    elif 76 < distance <= 610:
        precision = 6
    elif 610 < distance <= 2400:
        precision = 5
    elif 2400 < distance <= 20000:
        precision = 4
    else:
        precision = 3
    return precision


class dotdict(dict):
    '''用于操作 dict 对象
    >>> dd = dotdict(a=1, b=2)
    >>> dd.c = 3
    >>> dd
    {'a': 1, 'c': 3, 'b': 2}
    >>> del dd.c
    >>> dd
    {'a': 1, 'b': 2}
    '''

    def __getitem__(self, name):
        value = dict.__getitem__(self, name)
        if isinstance(value, dict) and not isinstance(value, dotdict):
            value = dotdict(value)
        return value

    def __getstate__(self):
        return dict(self)

    def __setstate__(self, state):
        self.update(state)

    def _asdict(self):
        return dict(self)

    __getattr__ = __getitem__
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


class dotdictex(dotdict):
    '''dotdict 的扩展，支持多级直接赋值
    >>> ddx = dotdictex()
    >>> ddx[1][1] = 1
    >>> ddx.a.a = 'a'
    >>> ddx
    {'a': {'a': 'a'}, 1: {1: 1}}
    '''

    def __getitem__(self, name):
        if name not in self:
            return self.setdefault(name, dotdictex())
        return dotdict.__getitem__(self, name)

    __getattr__ = __getitem__


def unzip(filename, basedir):
    zfile = zipfile.ZipFile(filename, "r")
    for name in zfile.namelist():
        if type(name) != unicode:
            encoding = cchardet.detect(name)['encoding']
            if encoding == 'UTF-8':
                unicode_name = name.decode('utf-8')
            elif encoding == 'ASCII':
                unicode_name = name
            else:
                unicode_name = name.decode('gbk')
        else:
            unicode_name = name

        f_name = os.path.join(basedir, unicode_name)
        pathname = os.path.dirname(f_name)
        if not os.path.exists(pathname) and pathname != "":
            os.makedirs(pathname)
        data = zfile.read(name)
        if not os.path.exists(f_name):
            fo = open(f_name, "w")
            fo.write(data)
            fo.close
    zfile.close()
