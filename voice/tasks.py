import os
from celery import shared_task
from django.conf import settings
from .models import CallLog
from openai import OpenAI

@shared_task
def process_call_recording(call_sid):
    try:
        call_log = CallLog.objects.get(call_sid=call_sid)
        
        # Determine file path
        filename = f"{call_sid}.webm"
        file_path = os.path.join(settings.MEDIA_ROOT, 'recordings', filename)
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return

        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # 1. Transcribe with Whisper
        print(f"Transcribing {filename}...")
        with open(file_path, "rb") as audio_file:
            transcript_res = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        
        transcript_text = transcript_res.text
        call_log.transcript = transcript_text
        call_log.save()

        # 2. Summarize with GPT
        print(f"Summarizing transcript...")
        response = client.chat.completions.create(
            model="gpt-4o", # or gpt-3.5-turbo
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes VoIP call transcripts for a business agency. Provide a concise summary and a list of action items."},
                {"role": "user", "content": f"Please summarize this call transcript:\n\n{transcript_text}"}
            ]
        )
        
        summary_text = response.choices[0].message.content
        call_log.summary = summary_text
        call_log.save()

        print(f"Successfully processed Call {call_sid}")
        
    except CallLog.DoesNotExist:
        print(f"CallLog {call_sid} not found")
    except Exception as e:
        print(f"Error processing call {call_sid}: {str(e)}")
