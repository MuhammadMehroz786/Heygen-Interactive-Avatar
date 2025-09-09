"use client";

import { useState, useRef, useEffect } from "react";
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
      content: "Hello! I'm your AI Tutor specialized in AI-related topics. How can I help you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Check if message is AI-related
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 
                       'neural network', 'chatgpt', 'llm', 'large language model', 'prompt', 
                       'algorithm', 'data science', 'nlp', 'computer vision', 'tensorflow', 
                       'pytorch', 'automation', 'robotics'];
    
    const isAIRelated = aiKeywords.some(keyword => lowercaseMessage.includes(keyword));
    
    if (!isAIRelated) {
      return "I specialize in AI-related topics only. Please ask about artificial intelligence, machine learning, or related technologies.";
    }

    // Professional, concise responses for AI topics
    if (lowercaseMessage.includes('prompt') || lowercaseMessage.includes('chatgpt')) {
      return "For effective prompts: Be specific, provide context, use clear instructions, and iterate based on results.";
    }
    
    if (lowercaseMessage.includes('machine learning') || lowercaseMessage.includes('ml')) {
      return "Machine learning uses algorithms to find patterns in data. Key types: supervised, unsupervised, and reinforcement learning.";
    }
    
    if (lowercaseMessage.includes('neural network') || lowercaseMessage.includes('deep learning')) {
      return "Neural networks mimic brain neurons to process data. Deep learning uses multiple layers for complex pattern recognition.";
    }
    
    if (lowercaseMessage.includes('ai ethics') || lowercaseMessage.includes('bias')) {
      return "AI ethics focuses on fairness, transparency, accountability, and avoiding harmful bias in AI systems.";
    }
    
    if (lowercaseMessage.includes('data science')) {
      return "Data science combines statistics, programming, and domain knowledge to extract insights from data.";
    }
    
    // Default professional response
    return "That's an interesting AI question. Could you be more specific about which aspect you'd like to explore?";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
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
        content: generateAIResponse(input.trim()),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
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