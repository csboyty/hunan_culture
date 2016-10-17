import os
from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware
from werkzeug.contrib.fixers import ProxyFix
from program import frontend


if "PSYCOGREEN" in os.environ:

    # Do our monkey patching
    #
    from gevent.monkey import patch_all

    patch_all()
    from psycogreen.gevent import patch_psycopg

    patch_psycopg()


application = ProxyFix(DispatcherMiddleware(None,
                                            {
                                                '/hnc': frontend.create_app(),
                                            }))

if __name__ == "__main__":
    run_simple("0.0.0.0", 8300, application, use_debugger=True)
