import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';
import './chatPage.css';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../utils/TimeUtils';

interface User {
  id: string;
  name: string;
}

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { token, user } = useAuthStore();
  const currentUserId = user?.id;
  
  const isLoggedIn = !!token && !!user;
  
  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return '(me)';
    return usersMap[senderId] || senderId;
  };
  
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      let fetchedMessages: any[] = [];
      let initialError: string | null = null;
      const usersMapLocal: Record<string, string> = {};
      
      try {
        const fetchInit: RequestInit = {};
        if (token) fetchInit.headers = { Authorization: `Bearer ${token}` };
        
        const res = await fetch(`/api/channel/${id}`, fetchInit);
        
        if (!res.ok) {
          if (res.status === 403) {
            if (!isLoggedIn) return navigate('/login');
            initialError = 'Access denied to this channel.';
          } else {
            throw new Error('Failed to load messages');
          }
        } else {
          const data = await res.json();
          fetchedMessages = data.messages || [];
        }
      } catch {
        initialError = 'Network error during message fetch.';
      }
      
      try {
        const fetchUsersInit: RequestInit = {};
        if (token) fetchUsersInit.headers = { Authorization: `Bearer ${token}` };
        
        const usersRes = await fetch('/api/user', fetchUsersInit);
        
        if (usersRes.ok) {
          const usersData: { users: User[] } = await usersRes.json();
          usersData.users.forEach((u) => {
            usersMapLocal[u.id] = u.name;
          });
        }
      } catch {
        console.warn('User fetch failed — names may show as IDs.');
      }
      
      setMessages(fetchedMessages);
      setUsersMap(usersMapLocal);
      setError(initialError);
      
      setLoading(false);
    };
    
    fetchData();
  }, [id, token, navigate, isLoggedIn]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    
    setSending(true);
    
    const tempId = Date.now().toString();
    const content = newMessage.trim();
    const optimisticTimestamp = new Date().toISOString();
    
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content,
        senderId: currentUserId || 'Me',
        timestamp: optimisticTimestamp,
      },
    ]);
    
    setNewMessage('');
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/channel/${id}/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        
        if (res.status === 403) {
          setError('Posting restricted — please log in.');
        } else {
          throw new Error('Failed to send message');
        }
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) return <LoadingSpinner size="large" centered />;
  
  return (
    <div className='page-wrapper'>
      <div className="chat-page">
        <header className="chat-header">
          <h1># {id}</h1>
          <button onClick={() => navigate('/dashboard')}>Back</button>
        </header>
        
        <div className="chat-messages">
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              const prev = messages[index - 1];
              
              const isGrouped =
                prev &&
                prev.senderId === msg.senderId &&
                Math.abs(
                  new Date(msg.timestamp).getTime() -
                  new Date(prev.timestamp).getTime()
                ) < 4 * 60 * 1000;
              
              const isSent =
                msg.senderId === currentUserId || msg.senderId === 'Me';
              
              return (
                <div
                  key={msg.id}
                  className={`message-item ${
                    isSent ? 'sent' : 'received'
                  } ${isGrouped ? 'grouped' : ''}`}
                >
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                    
                    {!isGrouped && (
                      <span className="message-sender">
                        {getSenderName(msg.senderId)}
                      </span>
                    )}
                    
                    <span className="message-time">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-messages">No messages yet.</div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {error && <div className="chat-error">{error}</div>}
        
        <div className="chat-input-section">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}

            
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();      // Stop newline
                handleSendMessage();     // Send message
              }
            }}

            placeholder="Type a message..."
            disabled={sending}
            className="message-input"
            rows={1}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
