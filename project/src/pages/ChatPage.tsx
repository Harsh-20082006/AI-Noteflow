import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, Send, Plus, MessageSquare, Trash2, X, Lightbulb, Code2,
  Database, Container, GitBranch, Zap, Loader2,
} from 'lucide-react';
import { supabase, type ChatConversation, type ChatMessage } from '@/lib/supabase';
import { generateChatResponse, SUGGESTED_PROMPTS } from '@/lib/ai';
import { Markdown } from '@/components/Markdown';

const ICON_MAP: Record<string, React.ReactNode> = {
  lightbulb: <Lightbulb className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  container: <Container className="w-4 h-4" />,
  git: <GitBranch className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
};

export function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (data) setConversations(data as ChatConversation[]);
    })();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConv) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', activeConv.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
    })();
  }, [activeConv]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const createConversation = useCallback(async (title: string): Promise<ChatConversation> => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ title: title.slice(0, 50) })
      .select()
      .single();
    if (error || !data) throw new Error('Failed to create conversation');
    const conv = data as ChatConversation;
    setConversations((prev) => [conv, ...prev]);
    return conv;
  }, []);

  const saveMessage = useCallback(async (convId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: convId, role, content })
      .select()
      .single();
    if (error || !data) return null;
    return data as ChatMessage;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    let conv = activeConv;
    if (!conv) {
      conv = await createConversation(text);
      setActiveConv(conv);
    }

    // Save user message
    const userMsg = await saveMessage(conv.id, 'user', text);
    if (userMsg) setMessages((prev) => [...prev, userMsg]);

    // Generate and stream response
    setTyping(true);
    const response = generateChatResponse(text);

    // Simulate typing animation
    await new Promise((r) => setTimeout(r, 600));
    setTyping(false);

    const assistantMsg = await saveMessage(conv.id, 'assistant', response);
    if (assistantMsg) setMessages((prev) => [...prev, assistantMsg]);

    // Update conversation timestamp
    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conv.id);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv!.id ? { ...c, updated_at: new Date().toISOString() } : c))
    );

    setLoading(false);
  }, [activeConv, loading, createConversation, saveMessage]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    await supabase.from('chat_conversations').delete().eq('id', id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConv?.id === id) {
      setActiveConv(null);
      setMessages([]);
    }
  }, [activeConv]);

  const handleNewChat = () => {
    setActiveConv(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Chat history sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:relative top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConv(conv);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group ${
                  activeConv?.id === conv.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                <span className="flex-1 text-left truncate">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-error-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile toggle */}
        <div className="lg:hidden p-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <MessageSquare className="w-4 h-4" />
            Chat History
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !typing ? (
            <EmptyChatState onPrompt={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {typing && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 border-0 focus:outline-none resize-none px-2 py-1.5 max-h-32"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-8 h-8 bg-primary-500 hover:bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
              AI responses are generated locally and may not always be accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          : 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
      }`}>
        {isUser ? <span className="text-xs font-bold">You</span> : <Sparkles className="w-4 h-4" />}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`inline-block max-w-full ${
          isUser
            ? 'bg-primary-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-md'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-2xl rounded-tl-md border border-slate-200 dark:border-slate-700'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <Markdown content={content} className="markdown-body text-sm" />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function EmptyChatState({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          AI Study Assistant
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Ask me about engineering concepts, get explanations, or explore topics from your notes.
        </p>

        <div className="grid sm:grid-cols-2 gap-2.5 text-left">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onPrompt(prompt.text)}
              className="flex items-center gap-2.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 transition-all group hover:shadow-md"
            >
              <span className="text-primary-500 group-hover:scale-110 transition-transform">
                {ICON_MAP[prompt.icon] || <Lightbulb className="w-4 h-4" />}
              </span>
              <span className="flex-1">{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
