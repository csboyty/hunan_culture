# coding:utf-8

from flask.ext.script import Manager, Shell
from flask.ext.migrate import Migrate, MigrateCommand

from program.core import db
from program.frontend import create_app
from program.manage import CreateUserCommand

app = create_app()
migrate = Migrate(app, db)
manager = Manager(app)


def make_shell_context():
    return dict(app=app, db=db)


manager.add_command('shell', Shell(make_context=make_shell_context))
manager.add_command('db', MigrateCommand)
manager.add_command('create_user', CreateUserCommand())

if __name__ == "__main__":
    manager.run()