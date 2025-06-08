from django.apps import AppConfig


from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from django.contrib import admin
        from rest_framework_simplejwt.token_blacklist.models import (
            OutstandingToken,
            BlacklistedToken,
        )
        from .admin_token import MyOutstandingTokenAdmin, MyBlacklistedTokenAdmin

        try:
            admin.site.unregister(OutstandingToken)
        except admin.sites.NotRegistered:
            pass

        try:
            admin.site.unregister(BlacklistedToken)
        except admin.sites.NotRegistered:
            pass

        try:
            admin.site.register(OutstandingToken, MyOutstandingTokenAdmin)
        except admin.sites.AlreadyRegistered:
            pass

        try:
            admin.site.register(BlacklistedToken, MyBlacklistedTokenAdmin)
        except admin.sites.AlreadyRegistered:
            pass