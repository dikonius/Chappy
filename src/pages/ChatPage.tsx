import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';
import './chatPage.css';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ✅ match route param
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        navigate('/login'); 
        return;
      }

      
    if (!id) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/channel/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          if (res.status === 403) {
            setError('Login required for this channel');
          } else {
            throw new Error('Failed to load messages');
          }
        } else {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    setSending(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/channel/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError('Login required to send messages');
        } else {
          throw new Error('Failed to send message');
        }
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: data.timestamp,
            content: newMessage.trim(),
            senderId: 'self',
            timestamp: data.timestamp,
          },
        ]);
        setNewMessage('');
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1># {id}</h1>
        <button onClick={() => navigate('/dashboard')}>Back</button>
      </header>

      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${msg.senderId === 'self' ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-input-section">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="message-input"
          rows={1}
        />
        <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
