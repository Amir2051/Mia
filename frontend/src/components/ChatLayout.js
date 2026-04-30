'use client';
import { useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import InvestigatePanel from './InvestigatePanel';

export default function ChatLayout() {
  const { getToken } = useAuth();
  const chat = useChat(getToken);
  const [showInvestigate, setShowInvestigate] = useState(false);

  useEffect(() => { chat.loadConversations(); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {showInvestigate && <InvestigatePanel onClose={() => setShowInvestigate(false)} />}
      <Sidebar
        conversations={chat.conversations}
        activeConversation={chat.activeConversation}
        onSelect={chat.selectConversation}
        onNew={chat.newConversation}
        onDelete={chat.deleteConversation}
        onInvestigate={() => setShowInvestigate(true)}
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
