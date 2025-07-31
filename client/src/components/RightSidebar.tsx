import { useState } from "react";
import { X, Save } from "lucide-react";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import type { Project } from "@shared/schema";

interface RightSidebarProps {
  activeProject: Project | undefined;
}

export function RightSidebar({ activeProject }: RightSidebarProps) {
  const [coreDirection, setCoreDirection] = useState({
    whatBuilding: '',
    whyMatters: '',
    whoFor: '',
  });
  const [executionRules, setExecutionRules] = useState('');
  const [teamCulture, setTeamCulture] = useState('');

  if (!activeProject) {
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
    console.log(`Saving ${section} for project ${activeProject.id}`);
  };

  return (
    <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mt-[5px] mb-[5px]">
        <h2 className="font-semibold hatchin-text text-[16px]">🧠 Project Overview</h2>
        <button className="hatchin-text-muted hover:text-hatchin-text">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="hatchin-text-muted text-[12px] mt-[5px] mb-[5px]">
        A shared brain for your team to stay aligned.
      </p>
      {/* Project Progress */}
      <div className="mt-[18px] mb-[18px]">
        <h3 className="text-sm font-medium mb-4 hatchin-text">Project Progress</h3>
        
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
      {/* Core Direction */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium hatchin-text">🎯 Core Direction</h3>
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
          
          <div>
            <label className="block text-sm font-medium mb-2 hatchin-text">
              Who is this for?
            </label>
            <textarea 
              value={coreDirection.whoFor}
              onChange={(e) => setCoreDirection(prev => ({ ...prev, whoFor: e.target.value }))}
              className="w-full hatchin-bg-card hatchin-border border rounded-lg px-3 py-2 text-sm hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-hatchin-blue focus:border-transparent" 
              rows={3}
              placeholder="Who's the target audience, customer, or beneficiary?"
            />
          </div>
        </div>
      </div>
      {/* Execution Ground Rules */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium hatchin-text">⚡ Execution Ground Rules</h3>
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
          placeholder="Define team principles, constraints, or guidelines"
        />
      </div>
      {/* Team Culture & Style */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium hatchin-text">🎨 Team Culture & Style</h3>
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
          placeholder="Describe communication style, values, or cultural preferences"
        />
      </div>
    </aside>
  );
}
