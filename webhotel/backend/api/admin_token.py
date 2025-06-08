from django.contrib import admin

class MyOutstandingTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'jti', 'created_at', 'expires_at')
    search_fields = ('user__username', 'jti')

class MyBlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'blacklisted_at')
    search_fields = ('token__jti',)
