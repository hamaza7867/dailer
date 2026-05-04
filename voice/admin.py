from django.contrib import admin
from .models import CallLog

@admin.register(CallLog)
class CallLogAdmin(admin.ModelAdmin):
    list_display = ('call_sid', 'user', 'status', 'duration', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('call_sid', 'user__username')
