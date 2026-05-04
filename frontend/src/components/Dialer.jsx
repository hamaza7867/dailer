import React, { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { voiceService } from '../apiService';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';

const Dialer = () => {
    const [device, setDevice] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [callStatus, setCallStatus] = useState('Idle');
    const [isMuted, setIsMuted] = useState(false);
    const [activeConnection, setActiveConnection] = useState(null);
    
    // Recording state
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        setupDevice();
        return () => {
            if (device) {
                device.destroy();
            }
        };
    }, []);

    const setupDevice = async () => {
        try {
            const { token } = await voiceService.getTwilioToken();
            const newDevice = new Device(token, {
                codecPreferences: ['opus', 'pcmu'],
                fakeLocalAudio: false,
                enableIceRestart: true,
            });

            newDevice.on('registered', () => {
                setCallStatus('Ready');
            });

            newDevice.on('error', (error) => {
                console.error('Twilio Device Error:', error);
                setCallStatus('Error');
            });

            newDevice.on('connect', (call) => {
                setCallStatus('Connected');
                setActiveConnection(call);
                startRecording();
            });

            newDevice.on('disconnect', (call) => {
                setCallStatus('Ready');
                setActiveConnection(null);
                const callSid = call.parameters.CallSid;
                stopRecording(callSid);
            });

            await newDevice.register();
            setDevice(newDevice);
        } catch (error) {
            console.error('Failed to setup Twilio Device:', error);
            setCallStatus('Setup Failed');
        }
    };

    const handleCall = async () => {
        if (device && phoneNumber) {
            try {
                const params = { To: phoneNumber };
                const call = await device.connect({ params });
                setActiveConnection(call);
            } catch (error) {
                console.error('Call failed:', error);
            }
        }
    };

    const handleHangup = () => {
        if (device) {
            device.disconnectAll();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                console.log('Local Recording Saved:', audioUrl);
                // In a production app, you might upload this to S3 or similar
            };

            mediaRecorderRef.current.start();
            console.log('Recording started...');
        } catch (error) {
            console.error('Recording failed to start:', error);
        }
    };

    const stopRecording = (callSid) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                console.log('Local Recording Ready:', audioUrl);

                if (callSid) {
                    try {
                        console.log(`Uploading recording for CallSid: ${callSid}...`);
                        await voiceService.uploadRecording(audioBlob, callSid);
                        console.log('Upload successful!');
                    } catch (error) {
                        console.error('Failed to upload recording to backend:', error);
                    }
                }
            };
            mediaRecorderRef.current.stop();
            console.log('Recording stopped.');
        }
    };

    const toggleMute = () => {
        if (activeConnection) {
            const muted = !isMuted;
            activeConnection.mute(muted);
            setIsMuted(muted);
        }
    };

    return (
        <div className="dialer-container">
            <div className="dialer-card">
                <h2>Cyphex VoIP Dialer</h2>
                <div className={`status-badge ${callStatus.toLowerCase()}`}>
                    {callStatus}
                </div>

                <div className="input-group">
                    <input
                        type="tel"
                        placeholder="Enter phone number (e.g. +1234567890)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={callStatus === 'Connected'}
                    />
                </div>

                <div className="controls">
                    {callStatus !== 'Connected' ? (
                        <button className="call-btn" onClick={handleCall} disabled={!phoneNumber || callStatus !== 'Ready'}>
                            <Phone size={24} /> Call
                        </button>
                    ) : (
                        <div className="active-controls">
                            <button className="mute-btn" onClick={toggleMute}>
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button className="hangup-btn" onClick={handleHangup}>
                                <PhoneOff size={24} /> Hang Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .dialer-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: #0f172a;
                    color: white;
                    font-family: 'Inter', sans-serif;
                }
                .dialer-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    width: 350px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                h2 { margin-bottom: 1.5rem; font-weight: 700; color: #f8fafc; }
                .status-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    margin-bottom: 1.5rem;
                    text-transform: capitalize;
                }
                .ready { background: #16a34a; }
                .connected { background: #2563eb; }
                .idle { background: #64748b; }
                .error { background: #dc2626; }
                
                .input-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: #334155;
                    border: 1px solid #475569;
                    border-radius: 12px;
                    color: white;
                    font-size: 1.125rem;
                    margin-bottom: 1.5rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-group input:focus { border-color: #3b82f6; }
                
                .controls { display: flex; justify-content: center; gap: 1rem; }
                .call-btn, .hangup-btn, .mute-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    transition: transform 0.1s, opacity 0.2s;
                }
                .call-btn { background: #22c55e; color: white; width: 100%; justify-content: center; }
                .hangup-btn { background: #ef4444; color: white; }
                .mute-btn { background: #475569; color: white; }
                .call-btn:hover { background: #16a34a; }
                .hangup-btn:hover { background: #dc2626; }
                .call-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .active-controls { display: flex; gap: 1rem; width: 100%; }
                .active-controls button { flex: 1; justify-content: center; }
            `}</style>
        </div>
    );
};

export default Dialer;
