"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface MiniAITutorProps {
  className?: string;
  onClose?: () => void;
}

export function MiniAITutor({ className = "", onClose }: MiniAITutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! Ask me about AI, ML, or tech topics.",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = useCallback((userMessage: string): string => {
    const message = userMessage.trim();
    const lowerMessage = message.toLowerCase();
    
    // Get recent conversation context (last 5 messages for context)
    const recentMessages = messages.slice(-5);
    const previousTopics = recentMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase())
      .join(' ');
    
    // Extract and remember user's name
    const namePattern = /i'm\s+([a-zA-Z]+)|my\s+name\s+is\s+([a-zA-Z]+)|call\s+me\s+([a-zA-Z]+)/i;
    const nameMatch = message.match(namePattern);
    if (nameMatch) {
      const extractedName = nameMatch[1] || nameMatch[2] || nameMatch[3];
      setUserName(extractedName);
      return `Nice to meet you, ${extractedName}! What AI topic interests you?`;
    }
    
    // Handle name questions
    if (lowerMessage.includes("my name") || lowerMessage === "what's my name") {
      return userName ? `Your name is ${userName}.` : "I don't know your name yet. You can tell me!";
    }
    
    // Context-aware responses based on conversation history
    if (lowerMessage.includes("more about") || lowerMessage.includes("tell me more")) {
      if (previousTopics.includes('chatgpt')) return "ChatGPT advanced: Use system prompts, temperature settings, and few-shot examples.";
      if (previousTopics.includes('machine learning')) return "ML deep dive: Try scikit-learn for basics, then TensorFlow/PyTorch for deep learning.";
      if (previousTopics.includes('python')) return "Python next steps: Master pandas, numpy, then explore ML libraries like scikit-learn.";
      return "What specific topic from our chat interests you more?";
    }
    
    // Follow-up questions with context
    if (lowerMessage.includes("how") || lowerMessage.includes("what's the best way")) {
      if (previousTopics.includes('chatgpt')) return "Start with clear, specific prompts. Add examples. Iterate based on results.";
      if (previousTopics.includes('python')) return "Practice with real projects. Start small, use documentation, join communities.";
      if (previousTopics.includes('machine learning')) return "Begin with Python basics, then statistics, then hands-on ML projects.";
    }
    
    // Context continuation responses
    if (lowerMessage.includes("and what about") || lowerMessage.includes("what else")) {
      if (previousTopics.includes('chatgpt')) return "Also try: Chain prompts together, use role-playing, and adjust response length.";
      if (previousTopics.includes('python')) return "Also learn: Virtual environments, debugging tools, and version control with Git.";
      if (previousTopics.includes('machine learning')) return "Also explore: Feature engineering, model validation, and hyperparameter tuning.";
    }
    
    // Reference previous conversation
    if (lowerMessage.includes("you mentioned") || lowerMessage.includes("earlier you said")) {
      const lastBotMessage = recentMessages.filter(msg => msg.role === 'assistant').slice(-1)[0];
      if (lastBotMessage) {
        const topic = lastBotMessage.content.toLowerCase();
        if (topic.includes('chatgpt')) return "Yes, ChatGPT works best with specific, detailed prompts and examples.";
        if (topic.includes('python')) return "Right, Python has the best AI/ML ecosystem with libraries like pandas and scikit-learn.";
        if (topic.includes('machine learning')) return "Exactly, ML is about finding patterns in data through various algorithms.";
      }
      return "Could you be more specific about what I mentioned?";
    }
    
    // Simple greetings
    if (/^(hi|hello|hey)$/i.test(lowerMessage)) {
      return userName ? `Hi ${userName}! What can I help with?` : "Hi! What AI topic can I help with?";
    }
    
    // AI topic responses - very concise
    if (lowerMessage.includes('chatgpt')) return "ChatGPT: Be specific, use examples, iterate prompts.";
    if (lowerMessage.includes('prompt')) return "Good prompts: Clear context + specific instructions.";
    if (lowerMessage.includes('machine learning')) return "ML: Algorithms learn from data patterns.";
    if (lowerMessage.includes('python')) return "Python AI: pandas, numpy, scikit-learn, tensorflow.";
    if (lowerMessage.includes('ai tools')) return "Popular: ChatGPT, Claude, Midjourney, GitHub Copilot.";
    if (lowerMessage.includes('deep learning')) return "Deep learning: Neural networks with multiple layers.";
    if (lowerMessage.includes('data science')) return "Data science: Stats + coding + domain knowledge.";
    
    // Check if AI-related
    const aiTerms = ['ai', 'ml', 'algorithm', 'neural', 'coding', 'programming', 'automation'];
    const isAI = aiTerms.some(term => lowerMessage.includes(term));
    
    if (!isAI) return "I focus on AI topics. Ask about ML, programming, or AI tools.";
    
    return "Could you be more specific about the AI topic?";
  }, [userName, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(userInput),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 300);
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Bot className="w-4 h-4" />
          AI Tutor
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-80 h-96 shadow-xl border-blue-200">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Tutor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-800"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 text-white hover:bg-blue-800"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-80">
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ maxHeight: "240px" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] p-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {message.content}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-blue-600" />
                </div>
                <div className="bg-gray-100 p-2 rounded-lg rounded-bl-sm text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about AI topics..."
                disabled={isLoading}
                className="flex-1 text-sm h-8"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Specialized in AI, ML, and tech topics
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}