import { useEffect, useState } from "react";
import { useRouter } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Brain, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project, Agent } from "@shared/schema";

interface MayaChatProps {
  projectId: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'maya';
  timestamp: string;
}

export function MayaChat({ projectId }: MayaChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  // Fetch Maya agent
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const mayaAgent = agents?.find(agent => 
    agent.projectId === projectId && 
    agent.isSpecialAgent && 
    agent.name === "Maya"
  );

  // Initialize chat with Maya's welcome message
  useEffect(() => {
    if (mayaAgent && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: mayaAgent.personality?.welcomeMessage || "Hi! I'm Maya, your AI idea partner. Let's develop your idea together!",
        sender: 'maya',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [mayaAgent, messages.length]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    // Simulate Maya's response (in real implementation, this would call an AI service)
    setTimeout(() => {
      const mayaResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateMayaResponse(message),
        sender: 'maya',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, mayaResponse]);
    }, 1000);
  };

  const generateMayaResponse = (userInput: string): string => {
    const responses = [
      "That's a fascinating idea! Let's explore the core problem you're trying to solve. What specific challenge does this address?",
      "I love the direction you're thinking. Can you tell me more about who would benefit most from this solution?",
      "This has great potential! What would make your idea different from existing solutions in this space?",
      "Interesting concept! Let's think about the key features that would make this idea successful. What's the most important functionality?",
      "Great thinking! How do you envision users discovering and adopting your solution?",
      "This could really make an impact! What resources or skills do you think you'd need to bring this idea to life?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!project || !mayaAgent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Maya...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/"}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h1 className="text-white font-semibold">Chat with Maya</h1>
                  <p className="text-sm text-gray-400">{project.name} • AI Idea Partner</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                <Brain className="w-3 h-3 mr-1" />
                Idea Development
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700 h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <CardTitle className="text-white">Maya</CardTitle>
                    <p className="text-sm text-gray-400">AI Idea Partner • Online</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your idea with Maya..."
                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Brain Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  Project Brain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.brain?.documents?.map((doc) => (
                  <div key={doc.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-sm font-medium text-white">{doc.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-3">{doc.content}</p>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-2">Shared Memory</h4>
                  <p className="text-xs text-gray-400">
                    {project.brain?.sharedMemory || "No shared memory yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}