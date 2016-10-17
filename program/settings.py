# coding:utf-8

import os

DEBUG = True

basedir = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))

SECURITY_LOGIN_USER_TEMPLATE = "backend/login.html"
SECURITY_POST_LOGIN_VIEW = "/hnc/home"
SECURITY_POST_LOGOUT_VIEW = "/hnc/login"
SECURITY_RESET_WITHIN = "3 days"
SECURITY_SEND_REGISTER_EMAIL = False
SECURITY_CONFIRMABLE = False
SECURITY_REGISTERABLE = False
SECURITY_CHANGEABLE = False
SECURITY_RECOVERABLE = True
SECURITY_POST_CHANGE_VIEW = "/hnc/home"
SECURITY_POST_RESET_VIEW = "/hnc/home"
SECURITY_UNAUTHORIZED_VIEW = "/hnc/403"
SECURITY_MSG_EMAIL_NOT_PROVIDED = (u'邮箱不能为空', 'error')
SECURITY_MSG_PASSWORD_NOT_PROVIDED = (u'密码不能为空', 'error')
SECURITY_MSG_USER_DOES_NOT_EXIST = (u'用户不存在', 'error')
SECURITY_MSG_INVALID_PASSWORD = (u'无效的密码', 'error')


qiniu_bucket = u"hn-culture"
qiniu_baseurl = u"7u2fft.com1.z0.glb.clouddn.com"
tmp_dir = u"/tmp/hnc"
qiniu_hnc_pkg_sync_dir = u"/home/dev/hnc-files/pkg"
qiniu_hnc_pkg_prefix = u"http://7u2fft.com1.z0.glb.clouddn.com/pkg/"
qiniu_ak = "Q-DeiayZfPqA0WDSOGSf-ekk345VrzuZa_6oBrX_"
qiniu_sk = "fIiGiRr3pFmHOmBDR2Md1hTCqpMMBcE_gvZYMzwD"




