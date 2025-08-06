import { useState, useEffect } from "react";
import * as React from "react";
import { X, Save } from "lucide-react";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import type { Project, Team, Agent } from "@shared/schema";

interface RightSidebarProps {
  activeProject: Project | undefined;
  activeTeam?: Team;
  activeAgent?: Agent;
}

export function RightSidebar({ activeProject, activeTeam, activeAgent }: RightSidebarProps) {
  // Initialize with project data when available
  const [coreDirection, setCoreDirection] = useState({
    whatBuilding: activeProject?.coreDirection?.whatBuilding || '',
    whyMatters: activeProject?.coreDirection?.whyMatters || '',
    whoFor: activeProject?.coreDirection?.whoFor || '',
  });
  const [executionRules, setExecutionRules] = useState(activeProject?.executionRules || '');
  const [teamCulture, setTeamCulture] = useState(activeProject?.teamCulture || '');

  // Update state when activeProject changes
  React.useEffect(() => {
    if (activeProject) {
      setCoreDirection({
        whatBuilding: activeProject.coreDirection?.whatBuilding || '',
        whyMatters: activeProject.coreDirection?.whyMatters || '',
        whoFor: activeProject.coreDirection?.whoFor || '',
      });
      setExecutionRules(activeProject.executionRules || '');
      setTeamCulture(activeProject.teamCulture || '');
    }
  }, [activeProject]);

  // Determine which view to show based on selection
  const getActiveView = () => {
    if (activeAgent) {
      return 'agent';
    } else if (activeTeam) {
      return 'team';
    } else if (activeProject) {
      return 'project';
    }
    return 'none';
  };

  const activeView = getActiveView();

  if (activeView === 'none') {
    return (
      <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 flex items-center justify-center">
        <div className="text-center hatchin-text-muted">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-sm">
            Select a project to view its overview
          </p>
        </div>
      </aside>
    );
  }

  const handleSave = (section: string) => {
    console.log(`Saving ${section} for ${activeView} ${activeProject?.id || activeTeam?.id || activeAgent?.id}`);
  };

  // Agent Profile View
  if (activeView === 'agent') {
    return (
      <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mt-[5px] mb-[5px]">
          <h2 className="font-semibold hatchin-text text-[16px]">👤 Agent Profile</h2>
          <button className="hatchin-text-muted hover:text-hatchin-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="hatchin-text-muted text-[12px] mt-[5px] mb-[5px]">
          Performance and capabilities of {activeAgent?.name}
        </p>
        
        {/* Agent Info */}
        <div className="mt-[18px] mb-[18px]">
          <div className="hatchin-bg-card rounded-lg p-4 mb-4">
            <div className="mb-2">
              <span className="text-sm font-medium hatchin-text">Role: </span>
              <span className="hatchin-text-muted text-sm">{activeAgent?.role}</span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium hatchin-text">Team: </span>
              <span className="hatchin-text-muted text-sm">{activeAgent?.teamId || 'Individual Agent'}</span>
            </div>
            <div className="text-xs hatchin-text-muted">
              Agent performance metrics and conversation analytics will appear here.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Team Dashboard View
  if (activeView === 'team') {
    return (
      <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mt-[5px] mb-[5px]">
          <h2 className="font-semibold hatchin-text text-[16px]">👥 Team Dashboard</h2>
          <button className="hatchin-text-muted hover:text-hatchin-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="hatchin-text-muted text-[12px] mt-[5px] mb-[5px]">
          Performance and collaboration metrics for {activeTeam?.name}
        </p>
        
        {/* Team Info */}
        <div className="mt-[18px] mb-[18px]">
          <div className="hatchin-bg-card rounded-lg p-4 mb-4">
            <div className="mb-2">
              <span className="text-sm font-medium hatchin-text">Team: </span>
              <span className="hatchin-text-muted text-sm">{activeTeam?.name}</span>
            </div>
            <div className="text-xs hatchin-text-muted">
              Team collaboration metrics, performance analytics, and member insights will appear here.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Project Overview View (existing content)
  return (
    <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mt-[5px] mb-[5px]">
        <h2 className="font-semibold hatchin-text text-[16px]">📖 Project Bible</h2>
        <button className="hatchin-text-muted hover:text-hatchin-text">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="hatchin-text-muted text-[12px] mt-[5px] mb-[5px]">
        Single source of truth for all AI agents and team members.
      </p>
      {/* Project Progress */}
      <div className="mt-[18px] mb-[18px]">
        <h3 className="text-sm font-medium hatchin-text mt-[3px] mb-[3px]">Project Progress</h3>
        
        <div className="hatchin-bg-card rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="hatchin-text-muted text-[12px]">
              Time spent: {activeProject.timeSpent}
            </span>
            <span className="hatchin-text text-[#1cd979] font-bold text-[12px]">
              {activeProject.progress}% complete
            </span>
          </div>
          
          <div className="mb-4">
            <div className="hatchin-text-muted mb-2 text-[12px]">
              2.5 weeks — 3 working phases
            </div>
            
            <ProgressTimeline progress={activeProject.progress} />
          </div>
          
          <div className="text-xs hatchin-text-muted leading-relaxed">
            Expected effort: ~18 hours/week from user.<br/>
            This timeline is estimated based on project complexity, goals, and required work hours.<br/>
            You can request changes through chat or edit it manually if needed.
          </div>
        </div>
      </div>
      {/* Core Direction - Most Important Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium hatchin-text">🎯 Core Direction</h3>
            <p className="text-xs hatchin-text-muted">Foundation that guides all decisions</p>
          </div>
          <button 
            onClick={() => handleSave('core-direction')}
            className="hatchin-blue text-sm hover:text-opacity-80 transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 hatchin-text">
              What are you building?
            </label>
            <textarea 
              value={coreDirection.whatBuilding}
              onChange={(e) => setCoreDirection(prev => ({ ...prev, whatBuilding: e.target.value }))}
              className="w-full hatchin-bg-card hatchin-border border rounded-lg px-3 py-2 text-sm hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent" 
              rows={3}
              placeholder="Describe the project in one clear sentence"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 hatchin-text">
              Why does this matter?
            </label>
            <textarea 
              value={coreDirection.whyMatters}
              onChange={(e) => setCoreDirection(prev => ({ ...prev, whyMatters: e.target.value }))}
              className="w-full hatchin-bg-card hatchin-border border rounded-lg px-3 py-2 text-sm hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent" 
              rows={3}
              placeholder="What's the core purpose or motivation?"
            />
          </div>
          

        </div>
      </div>
      {/* Target Audience & Market */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium hatchin-text">🎯 Target Audience</h3>
            <p className="text-xs hatchin-text-muted">Who we're building for and why they matter</p>
          </div>
          <button 
            onClick={() => handleSave('target-audience')}
            className="hatchin-blue text-sm hover:text-opacity-80 transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
        
        <textarea 
          value={coreDirection.whoFor}
          onChange={(e) => setCoreDirection(prev => ({ ...prev, whoFor: e.target.value }))}
          className="w-full hatchin-bg-card hatchin-border border rounded-lg px-3 py-2 text-sm hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent" 
          rows={4}
          placeholder="Describe your target users: demographics, pain points, goals, behavior patterns, and what success looks like for them."
        />
      </div>

      {/* Execution Ground Rules */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium hatchin-text">⚡ Execution Ground Rules</h3>
            <p className="text-xs hatchin-text-muted">Non-negotiable principles for the team</p>
          </div>
          <button 
            onClick={() => handleSave('execution-rules')}
            className="hatchin-blue text-sm hover:text-opacity-80 transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
        
        <textarea 
          value={executionRules}
          onChange={(e) => setExecutionRules(e.target.value)}
          className="w-full hatchin-bg-card hatchin-border border rounded-lg px-3 py-2 text-sm hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent" 
          rows={4}
          placeholder="Define team principles, constraints, standards, deadlines, budget limits, and quality requirements that everyone must follow."
        />
      </div>
      {/* Brand Guidelines & Team Culture */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium hatchin-text">🎨 Brand Guidelines & Culture</h3>
            <p className="text-xs hatchin-text-muted">Voice, style, and team communication preferences</p>
          </div>
          <button 
            onClick={() => handleSave('team-culture')}
            className="hatchin-blue text-sm hover:text-opacity-80 transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
        
        <textarea 
          value={teamCulture}
          onChange={(e) => setTeamCulture(e.target.value)}
          className="w-full hatchin-bg-card hatchin-border border rounded-lg px-3 py-2 text-sm hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent" 
          rows={4}
          placeholder="Define brand voice, communication style, design preferences, cultural values, and how the team should interact with users and each other."
        />
      </div>
    </aside>
  );
}
