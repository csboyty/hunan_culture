# coding:utf-8



import functools
import inspect


def memoize(timeout=None, make_name=None, unless=None):
    def memoize(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = decorated_function.make_cache_key(f, *args, **kwargs)
            print cache_key
            return f(*args, **kwargs)

        decorated_function.uncached = f
        decorated_function.cache_timeout = timeout
        decorated_function.make_cache_key = _memoize_make_cache_key(make_name)
        return decorated_function

    return memoize


def _memoize_make_cache_key(make_name=None):
    def make_cache_key(f, *args, **kwargs):
        keyargs, keykwargs = _memoize_kwargs_to_args(f, *args, **kwargs)
        print keyargs, keykwargs

    return make_cache_key


def _memoize_kwargs_to_args(f, *args, **kwargs):
    new_args = []
    new_kwargs = {}
    arg_num = 0
    argspec = inspect.getargspec(f)

    args_len = len(argspec.args)
    for i in range(args_len):
        arg = argspec.args[i]
        if i == 0 and arg in ('self', 'cls'):
            new_args.append(repr(args[0]))
            arg_num += 1
        elif arg in kwargs:
            kwargs.update(arg=kwargs.pop(arg))
        elif arg_num < len(args):
            arg = args[arg_num]
            arg_num += 1
        elif abs(i - args_len) <= len(argspec.defaults):
            arg = argspec.defaults[i - args_len]
            arg_num += 1
        else:
            arg = None
            arg_num += 1
        new_args.append(arg)

    return tuple(new_args), {}


class Foo(object):
    @memoize(timeout=10)
    def f1(self, a, b, k1=1, k2=2, *args, **kwargs):
        print k1,k2
        return 40


foo = Foo()
foo.f1(1, 2, 3,  k3=3, k4=4)
