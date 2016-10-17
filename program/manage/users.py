# coding:utf-8
from __future__ import print_function
from flask.ext.script import Command, prompt, prompt_pass
from flask_security.forms import RegisterForm
from flask_security.registerable import register_user
from werkzeug.datastructures import MultiDict


class CreateUserCommand(Command):
    def run(self):
        email = prompt('Email')
        password = prompt_pass('Password')
        password_confirm = prompt_pass('Confirm Password')
        fullname = prompt('Fullname')
        tel = prompt('Tel')
        active = bool(prompt('Actvice immediately', default='True'))
        role = prompt('Role', default='admin')
        data = MultiDict(
            dict(email=email, password=password, password_confirm=password_confirm, fullname=fullname, tel=tel,
                 active=active, role=role))
        form = RegisterForm(data, csrf_enabled=False)
        if form.validate():
            user = register_user(email=email, password=password, fullname=fullname, tel=tel,
                                 active=active, role=role)
            print("\nUser created successfully")
            print("User(id=%s,email=%s,fullname=%s)" % (user.id, user.email, user.fullname))
            return
        print("\nError creating user:")
        for errors in form.errors.values():
            print("\n".join(errors))





