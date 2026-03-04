'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Send, Loader2, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
    const user = useAuthStore((s) => s.user);
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const { data } = await api.get('/messages');
            setConversations(data.data || []);
        } catch {
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (otherUserId: string) => {
        setActiveChat(otherUserId);
        try {
            const { data } = await api.get(`/messages/${otherUserId}`);
            setMessages(data.data || []);
        } catch {
            setMessages([]);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeChat) return;
        try {
            const { data } = await api.post('/messages', {
                receiverId: activeChat,
                content: input.trim(),
            });
            setMessages((m) => [...m, data.data]);
            setInput('');
            loadConversations();
        } catch {
            // handle error
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Conversation list */}
            <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 glass overflow-hidden`}>
                <div className="p-4 border-b border-white/5">
                    <h2 className="font-semibold text-white">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <button
                            key={conv.partner?.id}
                            onClick={() => loadMessages(conv.partner?.id)}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${activeChat === conv.partner?.id ? 'bg-white/5' : ''
                                }`}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-medium shrink-0">
                                {conv.partner?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <span className="font-medium text-white text-sm truncate">{conv.partner?.name}</span>
                                    {conv.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-brand-500 rounded-full text-xs text-white flex items-center justify-center">{conv.unreadCount}</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.content}</p>
                            </div>
                        </button>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-8 text-center">
                            <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 glass overflow-hidden`}>
                {activeChat ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex items-center gap-3">
                            <button onClick={() => setActiveChat(null)} className="md:hidden btn-ghost p-1">←</button>
                            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {conversations.find((c) => c.partner?.id === activeChat)?.partner?.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-white">
                                {conversations.find((c) => c.partner?.id === activeChat)?.partner?.name || 'Chat'}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.senderId === user?.id
                                            ? 'bg-brand-600 text-white rounded-br-md'
                                            : 'bg-white/10 text-gray-200 rounded-bl-md'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    className="input-field flex-1"
                                    placeholder="Type a message..."
                                />
                                <button onClick={sendMessage} className="btn-primary px-4">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">Select a conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
