import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';
import './dmPage.css';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../utils/TimeUtils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
}

const DmPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [receiverName, setReceiverName] = useState<string>('Unknown');
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token, user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = user?.id;
  
  useEffect(() => {
    if (!id) return;
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch messages
        const res = await fetch(`/api/dm/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error('Failed to load messages');
        
        const data = await res.json();
        setMessages(data.messages || []);
        
        // Fetch users for names
        const usersRes = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (usersRes.ok) {
          const usersData: { users: User[] } = await usersRes.json();
          const map: Record<string, string> = {};
          
          usersData.users.forEach((u) => (map[u.id] = u.name));
          setUsersMap(map);
          
          setReceiverName(map[id] || id);
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, token, navigate]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || !token || !user) return;
    
    setSending(true);
    
    const tempId = Date.now().toString();
    const content = newMessage.trim();
    const optimisticTimestamp = new Date().toISOString();
    
    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content,
        senderId: currentUserId!,
        timestamp: optimisticTimestamp,
      },
    ]);
    
    setNewMessage('');
    
    try {
      const res = await fetch(`/api/dm/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw new Error('Failed to send');
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) return <LoadingSpinner size="large" />;
  
  return (
    <div className='page-wrapper'>
      <div className="dm-page">
    <header className="dm-header">
    <h1>DM with {receiverName}</h1>
    <button onClick={() => navigate('/dashboard')}>Back</button>
    </header>
    
    <div className="dm-messages">
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
        
        return (
          <div
          key={msg.id}
          className={`message-item ${
            msg.senderId === currentUserId ? 'sent' : 'received'
          } ${isGrouped ? 'grouped' : ''}`}
          >
          <div className="message-bubble">
          <p>{msg.content}</p>
          
          {/* Sender name */}
          {!isGrouped && (
            <span className="message-sender">
            {msg.senderId === currentUserId
              ? '(me)'
              : usersMap[msg.senderId] || msg.senderId}
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
      
      {error && <div className="dm-error">{error}</div>}
      
      <div className="dm-input-section">
      <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // Prevent newline
          handleSendMessage(); // Send message
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
  
  export default DmPage;
  