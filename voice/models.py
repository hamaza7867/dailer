from django.db import models
from django.contrib.auth.models import User

class CallLog(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='call_logs')
    call_sid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    duration = models.IntegerField(default=0, help_text="Duration in seconds")
    recording_url = models.URLField(max_length=500, null=True, blank=True)
    transcript = models.TextField(null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Call {self.call_sid} - {self.user.username}"
