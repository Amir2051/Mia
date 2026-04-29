'use client';
import { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

export default function ChatLayout() {
  const { getToken } = useAuth();
  const chat = useChat(getToken);

  useEffect(() => { chat.loadConversations(); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        conversations={chat.conversations}
        activeConversation={chat.activeConversation}
        onSelect={chat.selectConversation}
        onNew={chat.newConversation}
        onDelete={chat.deleteConversation}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatWindow
          messages={chat.messages}
          streaming={chat.streaming}
        />
        <ChatInput
          onSend={chat.sendMessage}
          onStop={chat.stopStreaming}
          disabled={chat.streaming}
          streaming={chat.streaming}
        />
      </div>
    </div>
  );
}
