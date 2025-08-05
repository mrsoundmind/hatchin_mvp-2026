import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Users, User, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project, Agent, Team } from '@shared/schema';

interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggested?: boolean;
  agents: {
    name: string;
    role: string;
    color: string;
    initials: string;
  }[];
}

interface IndividualAgent {
  name: string;
  role: string;
  color: string;
  initials: string;
  description: string;
  expertise: string[];
}

interface AddHatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: Omit<Agent, 'id'>) => void;
  activeProject: Project | null;
  existingAgents: Agent[];
}

const TEAM_TEMPLATES: TeamTemplate[] = [
  {
    id: 'product-team',
    name: 'Product Team',
    description: 'Build and ship amazing products',
    icon: '📱',
    suggested: true,
    agents: [
      { name: 'Alex', role: 'Product Manager', color: 'blue', initials: 'PM' },
      { name: 'Sarah', role: 'UI Designer', color: 'green', initials: 'UD' },
      { name: 'Mike', role: 'Developer', color: 'purple', initials: 'DV' }
    ]
  },
  {
    id: 'marketing-team',
    name: 'Marketing Team',
    description: 'Grow your audience and revenue',
    icon: '📈',
    agents: [
      { name: 'Emma', role: 'Growth Expert', color: 'orange', initials: 'GE' },
      { name: 'Jake', role: 'Copywriter', color: 'pink', initials: 'CW' },
      { name: 'Lisa', role: 'Content Creator', color: 'yellow', initials: 'CC' }
    ]
  },
  {
    id: 'design-team',
    name: 'Design Team',
    description: 'Create beautiful experiences',
    icon: '🎨',
    agents: [
      { name: 'Sarah', role: 'UI Designer', color: 'green', initials: 'UD' },
      { name: 'Tom', role: 'Brand Strategist', color: 'indigo', initials: 'BS' },
      { name: 'Jake', role: 'Copywriter', color: 'pink', initials: 'CW' }
    ]
  },
  {
    id: 'dev-team',
    name: 'Dev Team',
    description: 'Build robust and scalable systems',
    icon: '⚙️',
    agents: [
      { name: 'Mike', role: 'Developer', color: 'purple', initials: 'DV' },
      { name: 'Alex', role: 'Product Manager', color: 'blue', initials: 'PM' },
      { name: 'Emma', role: 'Growth Expert', color: 'orange', initials: 'GE' }
    ]
  },
  {
    id: 'launch-team',
    name: 'Launch Team',
    description: 'Successfully launch and scale your product',
    icon: '🚀',
    agents: [
      { name: 'Alex', role: 'Product Manager', color: 'blue', initials: 'PM' },
      { name: 'Emma', role: 'Growth Expert', color: 'orange', initials: 'GE' },
      { name: 'Jake', role: 'Copywriter', color: 'pink', initials: 'CW' },
      { name: 'Nina', role: 'PR Specialist', color: 'cyan', initials: 'PR' }
    ]
  },
  {
    id: 'analytics-team',
    name: 'Analytics Team',
    description: 'Make data-driven decisions',
    icon: '📊',
    agents: [
      { name: 'David', role: 'Data Analyst', color: 'teal', initials: 'DA' },
      { name: 'Emma', role: 'Growth Expert', color: 'orange', initials: 'GE' },
      { name: 'Alex', role: 'Product Manager', color: 'blue', initials: 'PM' }
    ]
  },
  {
    id: 'content-team',
    name: 'Content Team',
    description: 'Create engaging content and storytelling',
    icon: '✍️',
    agents: [
      { name: 'Lisa', role: 'Content Creator', color: 'yellow', initials: 'CC' },
      { name: 'Jake', role: 'Copywriter', color: 'pink', initials: 'CW' },
      { name: 'Tom', role: 'Brand Strategist', color: 'indigo', initials: 'BS' },
      { name: 'Nina', role: 'PR Specialist', color: 'cyan', initials: 'PR' }
    ]
  },
  {
    id: 'support-team',
    name: 'Customer Success',
    description: 'Ensure customer satisfaction and retention',
    icon: '🤝',
    agents: [
      { name: 'Amy', role: 'Customer Success', color: 'emerald', initials: 'CS' },
      { name: 'Jake', role: 'Copywriter', color: 'pink', initials: 'CW' },
      { name: 'Emma', role: 'Growth Expert', color: 'orange', initials: 'GE' }
    ]
  }
];

const INDIVIDUAL_AGENTS: IndividualAgent[] = [
  {
    name: 'Alex',
    role: 'Product Manager',
    color: 'blue',
    initials: 'PM',
    description: 'Leads product strategy, roadmap planning, and cross-functional coordination to deliver user-centered solutions.',
    expertise: ['Product Strategy', 'User Research', 'Roadmap Planning']
  },
  {
    name: 'Sarah',
    role: 'Product Designer',
    color: 'green',
    initials: 'PD',
    description: 'Creates intuitive user experiences and beautiful interfaces through research-driven design.',
    expertise: ['UI/UX Design', 'Prototyping', 'User Testing']
  },
  {
    name: 'Mike',
    role: 'UI Engineer',
    color: 'purple',
    initials: 'UE',
    description: 'Builds responsive frontend applications with modern frameworks and best practices.',
    expertise: ['React', 'TypeScript', 'Frontend Architecture']
  },
  {
    name: 'David',
    role: 'Backend Developer',
    color: 'red',
    initials: 'BD',
    description: 'Develops scalable server architecture, APIs, and database systems for robust applications.',
    expertise: ['Node.js', 'Databases', 'API Design']
  },
  {
    name: 'Emma',
    role: 'Growth Expert',
    color: 'orange',
    initials: 'GE',
    description: 'Drives user acquisition, retention, and revenue growth through data-driven strategies.',
    expertise: ['Growth Hacking', 'Analytics', 'User Acquisition']
  },
  {
    name: 'Jake',
    role: 'Copywriter',
    color: 'pink',
    initials: 'CW',
    description: 'Crafts compelling copy and messaging that converts visitors into customers.',
    expertise: ['Copywriting', 'Brand Voice', 'Conversion Optimization']
  },
  {
    name: 'Lisa',
    role: 'Content Creator',
    color: 'yellow',
    initials: 'CC',
    description: 'Develops engaging content strategies and creates multimedia content that resonates with audiences.',
    expertise: ['Content Strategy', 'Video Production', 'Social Media']
  },
  {
    name: 'Tom',
    role: 'Brand Strategist',
    color: 'indigo',
    initials: 'BS',
    description: 'Shapes brand identity, positioning, and messaging to create memorable brand experiences.',
    expertise: ['Brand Strategy', 'Market Positioning', 'Brand Identity']
  },
  {
    name: 'Amy',
    role: 'Customer Success',
    color: 'emerald',
    initials: 'CS',
    description: 'Ensures customer satisfaction, drives adoption, and builds long-term relationships.',
    expertise: ['Customer Onboarding', 'Retention', 'Support Strategy']
  },
  {
    name: 'Nina',
    role: 'PR Specialist',
    color: 'cyan',
    initials: 'PR',
    description: 'Manages public relations, media outreach, and builds brand awareness through strategic communications.',
    expertise: ['Media Relations', 'Press Releases', 'Crisis Communication']
  },
  {
    name: 'Ryan',
    role: 'Data Analyst',
    color: 'teal',
    initials: 'DA',
    description: 'Analyzes user behavior and business metrics to provide actionable insights for decision-making.',
    expertise: ['Data Analysis', 'Business Intelligence', 'Reporting']
  },
  {
    name: 'Sophie',
    role: 'Sales Expert',
    color: 'rose',
    initials: 'SE',
    description: 'Drives revenue growth through strategic sales processes, lead qualification, and relationship building.',
    expertise: ['Sales Strategy', 'Lead Generation', 'Conversion Optimization']
  },
  {
    name: 'Carlos',
    role: 'DevOps Engineer',
    color: 'slate',
    initials: 'DO',
    description: 'Manages infrastructure, deployment pipelines, and ensures reliable, scalable system operations.',
    expertise: ['CI/CD', 'Cloud Infrastructure', 'Monitoring']
  },
  {
    name: 'Zoe',
    role: 'QA Lead',
    color: 'amber',
    initials: 'QA',
    description: 'Ensures product quality through comprehensive testing strategies and quality assurance processes.',
    expertise: ['Test Automation', 'Quality Processes', 'Bug Tracking']
  }
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    amber: 'bg-amber-500'
  };
  return colorMap[color] || 'bg-gray-500';
};

export function AddHatchModal({ isOpen, onClose, onAddAgent, activeProject, existingAgents }: AddHatchModalProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'individual'>('teams');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter templates based on search
  const filteredTeamTemplates = useMemo(() => {
    if (!searchQuery) return TEAM_TEMPLATES;
    
    return TEAM_TEMPLATES.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.agents.some(agent => 
        agent.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  // Filter individual agents based on search
  const filteredIndividualAgents = useMemo(() => {
    if (!searchQuery) return INDIVIDUAL_AGENTS;
    
    return INDIVIDUAL_AGENTS.filter(agent =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.expertise.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  const handleUseTemplate = (template: TeamTemplate) => {
    if (!activeProject) return;

    // Create all agents from the template
    template.agents.forEach((templateAgent, index) => {
      // Check if agent with this role already exists
      const existingAgent = existingAgents.find(agent => agent.role === templateAgent.role);
      if (existingAgent) return; // Skip if already exists

      const agentData: Omit<Agent, 'id'> = {
        name: templateAgent.name,
        role: templateAgent.role,
        color: templateAgent.color,
        teamId: '', // Will be set by the parent component
        projectId: activeProject.id,
        personality: {
          traits: [],
          communicationStyle: 'professional',
          expertise: [],
          welcomeMessage: `Hi! I'm ${templateAgent.name}, your ${templateAgent.role}. Ready to help!`
        },
        isSpecialAgent: false
      };

      // Add slight delay between agents for better UX
      setTimeout(() => {
        onAddAgent(agentData);
      }, index * 200);
    });

    onClose();
  };

  const handleAddIndividualAgent = (agent: IndividualAgent) => {
    if (!activeProject) return;

    // Check if agent with this role already exists
    const existingAgent = existingAgents.find(existing => existing.role === agent.role);
    if (existingAgent) return; // Skip if already exists

    const agentData: Omit<Agent, 'id'> = {
      name: agent.name,
      role: agent.role,
      color: agent.color,
      teamId: '', // Will be set by the parent component
      projectId: activeProject.id,
      personality: {
        traits: [],
        communicationStyle: 'professional',
        expertise: agent.expertise,
        welcomeMessage: `Hi! I'm ${agent.name}, your ${agent.role}. ${agent.description}`
      },
      isSpecialAgent: false
    };

    onAddAgent(agentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#23262B] rounded-2xl border border-[#43444B] shadow-2xl flex flex-col" style={{ width: '1200px', height: '700px' }}>
        {/* Header */}
        <div className="p-6 border-b border-[#43444B] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#F1F1F3] mb-1">
              Add Hatch
            </h2>
            <p className="text-[#A6A7AB] text-sm">
              Add AI teammates to {activeProject?.name || 'your project'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A6A7AB] hover:text-[#F1F1F3] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area with Sidebar Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-64 border-r border-[#43444B] bg-[#1A1C1F]">
            <div className="p-4">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === 'teams'
                      ? 'bg-[#6C82FF] text-white'
                      : 'text-[#A6A7AB] hover:text-[#F1F1F3] hover:bg-[#2A2D33]'
                  }`}
                >
                  <Users size={20} />
                  <div className="flex-1">
                    <div className="text-[14px] font-bold">Teams Template</div>
                    <div className="text-xs opacity-75">Pre-built teams</div>
                  </div>
                  <div className="text-xs bg-black/20 px-2 py-1 rounded-full">
                    {TEAM_TEMPLATES.length}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('individual')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-[#A6A7AB] hover:text-[#F1F1F3] hover:bg-[#2A2D33] mt-[13px] mb-[13px]"
                >
                  <User size={20} />
                  <div className="flex-1">
                    <div className="font-medium text-[14px]">Individual Hatch</div>
                    <div className="text-xs opacity-75">Single specialists</div>
                  </div>
                  <div className="text-xs bg-black/20 px-2 py-1 rounded-full">
                    {INDIVIDUAL_AGENTS.length}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search Bar */}
            <div className="p-6 border-b border-[#43444B]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A6A7AB]" size={18} />
                <input
                  type="text"
                  placeholder={activeTab === 'teams' ? 'Search team templates...' : 'Search individual agents...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#37383B] border border-[#43444B] rounded-xl text-[#F1F1F3] placeholder-[#A6A7AB] focus:border-[#6C82FF] focus:outline-none focus:ring-1 focus:ring-[#6C82FF] transition-colors"
                />
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div 
                className="grid gap-4 grid-cols-3"
                style={{ 
                  gridTemplateColumns: 'repeat(3, 1fr)'
                }}
              >
                {(activeTab === 'teams' ? filteredTeamTemplates : filteredIndividualAgents).map((item, index) => (
                  <motion.div
                    key={activeTab === 'teams' ? item.id : index}
                    className="bg-[#37383B] rounded-xl p-3 border-2 transition-all duration-200 cursor-pointer flex flex-col border-[#43444B] hover:border-[#6C82FF]/50"
                    style={{ 
                      minHeight: '200px'
                    }}
                    onClick={() => activeTab === 'teams' ? handleUseTemplate(item) : handleAddIndividualAgent(item)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    layout={false}
                    initial={false}
                  >
                    {/* Pack Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                          activeTab === 'teams' ? 'bg-[#6C82FF]/20' : `${getColorClasses(item.color)}/20`
                        }`}>
                          {activeTab === 'teams' ? item.icon : item.initials}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#F1F1F3] text-sm mb-1 flex items-center gap-2">
                            {activeTab === 'teams' ? item.name : item.name}
                            {activeTab === 'teams' && item.suggested && (
                              <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className="text-[#6C82FF]"
                              >
                                <Sparkles size={10} />
                              </motion.div>
                            )}
                          </h3>
                          <p className="text-[#A6A7AB] text-xs leading-tight">
                            {activeTab === 'teams' ? item.description : item.role}
                          </p>
                        </div>
                      </div>
                      {activeTab === 'teams' && (
                        <div className="ml-1 text-[#A6A7AB] flex items-center gap-1">
                          <Users size={10} />
                          <span className="text-xs">{item.agents.length}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Team Preview - Compact */}
                    <div className="mt-2 mb-2">
                      {activeTab === 'teams' ? (
                        <div className="flex flex-wrap gap-1">
                          {item.agents.map((agent, agentIndex) => (
                            <div key={agentIndex} className="flex items-center gap-1 bg-[#23262B] rounded px-2 py-1">
                              <User className="w-3 h-3 text-[#6C82FF]" />
                              <span className="text-xs text-[#F1F1F3]">{agent.role}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#A6A7AB] text-xs leading-tight">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    {/* CTA Button - Fixed at bottom */}
                    <div className="mt-auto pt-2">
                      <button className="w-full px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium bg-[#43444B] hover:bg-[#6C82FF] text-[#F1F1F3] hover:text-white">
                        {activeTab === 'teams' ? 'Use Pack' : 'Add Agent'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* No results */}
              {((activeTab === 'teams' && filteredTeamTemplates.length === 0) || 
                (activeTab === 'individual' && filteredIndividualAgents.length === 0)) && (
                <div className="text-center py-12">
                  <div className="text-[#F1F1F3] text-lg mb-2">No results found</div>
                  <p className="text-[#A6A7AB] text-sm">
                    Try adjusting your search terms or browse all {activeTab === 'teams' ? 'templates' : 'agents'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}