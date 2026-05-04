import React, { useState, useEffect } from 'react';
import api from '../apiService';
import { Calendar, Clock, FileText, Play } from 'lucide-react';

const CallHistory = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/call-history/');
            setCalls(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="history-loading">Loading history...</div>;

    return (
        <div className="history-container">
            <h3>Call History & AI Insights</h3>
            <div className="history-list">
                {calls.map((call) => (
                    <div key={call.call_sid} className="history-item">
                        <div className="history-header">
                            <span className="sid">ID: {call.call_sid?.slice(-8)}</span>
                            <span className={`status ${call.status}`}>{call.status}</span>
                            <span className="date"><Calendar size={14} /> {new Date(call.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="history-body">
                            <div className="stat">
                                <Clock size={16} /> {call.duration}s
                            </div>
                            
                            {call.summary ? (
                                <div className="ai-content">
                                    <h4><FileText size={16} /> AI Summary</h4>
                                    <p>{call.summary}</p>
                                </div>
                            ) : (
                                <div className="ai-pending">AI processing in progress...</div>
                            )}

                            {call.recording_url && (
                                <a href={call.recording_url} target="_blank" rel="noopener noreferrer" className="play-btn">
                                    <Play size={16} /> Listen to Recording
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .history-container {
                    margin-top: 2rem;
                    width: 100%;
                    max-width: 800px;
                    color: white;
                }
                h3 { margin-bottom: 1.5rem; text-align: center; color: #94a3b8; }
                .history-list { display: flex; flex-direction: column; gap: 1rem; }
                .history-item {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: transform 0.2s;
                }
                .history-item:hover { transform: translateY(-2px); border-color: rgba(59, 130, 246, 0.5); }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                    color: #94a3b8;
                }
                .status { text-transform: uppercase; font-weight: 700; font-size: 0.75rem; }
                .completed { color: #22c55e; }
                .ai-content h4 { display: flex; align-items: center; gap: 0.5rem; color: #3b82f6; margin-bottom: 0.5rem; }
                .ai-content p { font-size: 0.9375rem; line-height: 1.5; color: #e2e8f0; }
                .ai-pending { font-style: italic; color: #64748b; font-size: 0.875rem; }
                .play-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: #1e293b;
                    border-radius: 8px;
                    color: #3b82f6;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border: 1px solid #3b82f6;
                }
                .play-btn:hover { background: #3b82f6; color: white; }
            `}</style>
        </div>
    );
};

export default CallHistory;
