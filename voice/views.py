from django.conf import settings
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from twilio.request_validator import RequestValidator
from .models import CallLog
import functools

class VoiceTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Create access token with credentials
        token = AccessToken(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_API_KEY_SID,
            settings.TWILIO_API_KEY_SECRET,
            identity=request.user.username
        )

        # Create a Voice grant and add it to the token
        voice_grant = VoiceGrant(
            outgoing_application_sid=settings.TWILIO_TWIML_APP_SID,
            incoming_allow=True,
        )
        token.add_grant(voice_grant)

        # Return token
        return Response({
            'token': token.to_jwt(),
            'identity': request.user.username
        })

from rest_framework.parsers import MultiPartParser, FormParser
import os

class CallStatusWebhookView(APIView):
    permission_classes = [AllowAny] # Twilio doesn't use standard auth

    def post(self, request, *args, **kwargs):
        validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
        
        # Get the full URL including protocol and host
        url = request.build_absolute_uri()
        signature = request.META.get('HTTP_X_TWILIO_SIGNATURE', '')
        
        # Twilio sends data as POST parameters
        data = request.data.dict()

        # Validate signature
        if not validator.validate(url, data, signature):
            return HttpResponse(status=403)

        call_sid = data.get('CallSid')
        call_status = data.get('CallStatus')
        duration = data.get('CallDuration', 0)
        recording_url = data.get('RecordingUrl', '')

        try:
            call_log = CallLog.objects.get(call_sid=call_sid)
            call_log.status = call_status
            call_log.duration = int(duration) if duration else 0
            if recording_url:
                call_log.recording_url = recording_url
            call_log.save()
            return Response({'status': 'updated'})
        except CallLog.DoesNotExist:
            # Optionally create the log if it doesn't exist (e.g., inbound calls)
            return Response({'status': 'not found'}, status=404)

class UploadRecordingView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        file_obj = request.FILES.get('recording')
        call_sid = request.data.get('call_sid')

        if not file_obj or not call_sid:
            return Response({'error': 'Missing file or call_sid'}, status=400)

        try:
            call_log = CallLog.objects.get(call_sid=call_sid)
            
            # Ensure the directory exists
            recordings_dir = os.path.join(settings.MEDIA_ROOT, 'recordings')
            if not os.path.exists(recordings_dir):
                os.makedirs(recordings_dir)
            
            # Save file
            filename = f"{call_sid}.webm"
            file_path = os.path.join(recordings_dir, filename)
            
            with open(file_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
            
            # Update call log
            recording_url = request.build_absolute_uri(settings.MEDIA_URL + 'recordings/' + filename)
            call_log.recording_url = recording_url
            call_log.save()

            # Trigger background AI processing
            from .tasks import process_call_recording
            process_call_recording.delay(call_sid)

            return Response({'status': 'uploaded', 'url': recording_url})
        except CallLog.DoesNotExist:
            return Response({'error': 'CallLog not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

from rest_framework import serializers

class CallLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallLog
        fields = ['call_sid', 'status', 'duration', 'recording_url', 'transcript', 'summary', 'created_at']

class CallLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        logs = CallLog.objects.filter(user=request.user).order_by('-created_at')
        serializer = CallLogSerializer(logs, many=True)
        return Response(serializer.data)
