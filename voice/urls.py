from django.urls import path
from .views import VoiceTokenView, CallStatusWebhookView, UploadRecordingView, CallLogListView

urlpatterns = [
    path('voice-token/', VoiceTokenView.as_view(), name='voice_token'),
    path('call-status-webhook/', CallStatusWebhookView.as_view(), name='call_status_webhook'),
    path('upload-recording/', UploadRecordingView.as_view(), name='upload_recording'),
    path('call-history/', CallLogListView.as_view(), name='call_history'),
]
