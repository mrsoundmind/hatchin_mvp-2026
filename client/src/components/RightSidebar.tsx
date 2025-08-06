import * as React from "react";
import { X, Save, ChevronDown, ChevronRight, Check } from "lucide-react";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { useToast } from "@/hooks/use-toast";
import { useRightSidebarState } from "@/hooks/useRightSidebarState";
import type { Project, Team, Agent } from "@shared/schema";

interface RightSidebarProps {
  activeProject: Project | undefined;
  activeTeam?: Team;
  activeAgent?: Agent;
}

export function RightSidebar({ activeProject, activeTeam, activeAgent }: RightSidebarProps) {
  const { toast } = useToast();
  const { state, actions } = useRightSidebarState(activeProject, activeTeam, activeAgent);

  const {
    coreDirection,
    executionRules,
    teamCulture,
    expandedSections,
    recentlySaved,
    activeView,
    isLoading,
    error,
  } = state;

  // Destructure actions from hook
  const {
    updateCoreDirection,
    updateExecutionRules,
    updateTeamCulture,
    toggleSection,
    setRecentlySaved,
  } = actions;

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

  // Real save functionality that persists data
  const handleSave = async (section: string, data: any) => {
    try {
      actions.setLoading(true);
      
      // Determine what data to save based on section
      let saveData: any = {};
      const entityId = activeProject?.id || activeTeam?.id || activeAgent?.id;
      
      if (!entityId) {
        throw new Error('No active entity to save to');
      }

      switch (section) {
        case 'core-direction':
          saveData = {
            coreDirection: {
              whatBuilding: coreDirection.whatBuilding,
              whyMatters: coreDirection.whyMatters,
              whoFor: coreDirection.whoFor,
            }
          };
          break;
        case 'execution-rules':
          saveData = { executionRules: executionRules };
          break;
        case 'team-culture':
          saveData = { teamCulture: teamCulture };
          break;
        default:
          saveData = data;
      }

      // Make API call to save data
      const response = await fetch(`/api/projects/${entityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      // Mark as recently saved for UI feedback
      setRecentlySaved(section);
      
      // Get the correct sidebar name based on active view
      const getSidebarName = () => {
        if (activeView === 'agent') return 'Agent Profile';
        if (activeView === 'team') return 'Team Dashboard';
        if (activeView === 'project') return 'Project Overview';
        return 'sidebar';
      };
      
      // Show success toast
      toast({
        title: "Saved successfully",
        description: `${section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} has been saved to ${getSidebarName()}.`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Save error:', error);
      actions.setError(error instanceof Error ? error.message : 'Save failed');
      
      toast({
        title: "Save failed",
        description: "Unable to save changes. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      actions.setLoading(false);
    }
  };

  // Agent Profile View
  if (activeView === 'agent') {
    return (
      <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
            <h2 className="font-semibold hatchin-text text-[16px]">Hatch Profile</h2>
          </div>
          <button className="hatchin-text-muted hover:text-hatchin-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="hatchin-text-muted text-[12px] mb-6">
          Performance and capabilities of {activeAgent?.name}
        </p>
        {/* Agent Overview Card */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium hatchin-text mb-4">Agent Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Name</span>
              <span className="text-sm hatchin-text">{activeAgent?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Role</span>
              <span className="text-sm hatchin-text">{activeAgent?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Team</span>
              <span className="text-sm hatchin-text">{activeAgent?.teamId || 'Individual Agent'}</span>
            </div>
          </div>
        </div>
        {/* Performance Metrics Card */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium hatchin-text mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Response Time</span>
              <span className="text-sm hatchin-text">~2.3s avg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Messages</span>
              <span className="text-sm hatchin-text">127 total</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Accuracy</span>
              <span className="text-sm text-green-400">94%</span>
            </div>
          </div>
        </div>
        {/* Capabilities Card */}
        <div className="hatchin-bg-card rounded-xl p-4">
          <h3 className="text-sm font-medium hatchin-text mb-4">Capabilities</h3>
          <div className="text-xs hatchin-text-muted leading-relaxed">
            Agent specializes in {activeAgent?.role.toLowerCase()} tasks with expertise in project collaboration, 
            technical analysis, and strategic planning. Performance analytics and conversation insights 
            will be enhanced as the agent gains more experience.
          </div>
        </div>
      </aside>
    );
  }

  // Team Dashboard View
  if (activeView === 'team') {
    return (
      <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm">👥</span>
            </div>
            <h2 className="font-semibold hatchin-text text-[16px]">Team Dashboard</h2>
          </div>
          <button className="hatchin-text-muted hover:text-hatchin-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="hatchin-text-muted text-[12px] mb-6">
          Performance and collaboration metrics for {activeTeam?.name}
        </p>
        
        {/* Team Overview Card */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium hatchin-text mb-4">Team Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Team Name</span>
              <span className="text-sm hatchin-text">{activeTeam?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Members</span>
              <span className="text-sm hatchin-text">3 agents</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Status</span>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </div>
        </div>

        {/* Collaboration Metrics Card */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium hatchin-text mb-4">Collaboration Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Messages</span>
              <span className="text-sm hatchin-text">45 today</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Avg Response</span>
              <span className="text-sm hatchin-text">~1.8s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm hatchin-text-muted">Sync Rate</span>
              <span className="text-sm text-green-400">92%</span>
            </div>
          </div>
        </div>

        {/* Team Insights Card */}
        <div className="hatchin-bg-card rounded-xl p-4">
          <h3 className="text-sm font-medium hatchin-text mb-4">Team Insights</h3>
          <div className="text-xs hatchin-text-muted leading-relaxed">
            {activeTeam?.name} is performing well with strong collaboration patterns. 
            Team members are actively engaged and response times are optimal. 
            Advanced analytics and performance insights will be available as more data is collected.
          </div>
        </div>
      </aside>
    );
  }

  // Project Overview View (redesigned to match screenshot)
  return (
    <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-sm">🧠</span>
          </div>
          <h2 className="font-semibold hatchin-text text-[16px]">Project Overview</h2>
        </div>
        <button className="hatchin-text-muted hover:text-hatchin-text">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="hatchin-text-muted text-[12px] mb-6">
        A shared brain for your team to stay aligned.
      </p>
      {/* Project Progress */}
      <div className="mt-[18px] mb-[18px]">
        <h3 className="text-sm font-medium hatchin-text mt-[3px] mb-[3px]">Project Progress</h3>
        
        <div className="hatchin-bg-card rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="hatchin-text-muted text-[12px]">
              Time spent: {activeProject?.timeSpent || '0 hours'}
            </span>
            <span className="hatchin-text text-[#1cd979] font-bold text-[12px]">
              {activeProject?.progress || 0}% complete
            </span>
          </div>
          
          <div className="mb-4">
            <div className="hatchin-text-muted mb-2 text-[12px]">
              2.5 weeks — 3 working phases
            </div>
            
            <ProgressTimeline progress={activeProject?.progress || 0} />
          </div>
          
          <div className="text-xs hatchin-text-muted leading-relaxed">
            Expected effort: ~18 hours/week from user.<br/>
            This timeline is estimated based on project complexity, goals, and required work hours.<br/>
            You can request changes through chat or edit it manually if needed.
          </div>
        </div>
      </div>
      {/* Core Direction - Collapsible Card */}
      <div className="hatchin-bg-card rounded-xl p-4 mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('coreDirection')}
        >
          <div className="flex items-center gap-2">
            {expandedSections.coreDirection ? 
              <ChevronDown className="w-4 h-4 hatchin-text-muted" /> : 
              <ChevronRight className="w-4 h-4 hatchin-text-muted" />
            }
            <h3 className="text-sm font-medium hatchin-text">Core Direction</h3>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSave('core-direction', null);
            }}
            className={`text-sm hover:text-opacity-80 transition-all duration-200 flex items-center gap-1 ${
              recentlySaved.has('core-direction') 
                ? 'text-green-400' 
                : 'hatchin-blue'
            }`}
          >
            {recentlySaved.has('core-direction') ? (
              <>
                <Check className="w-3 h-3" />
                Saved
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
        
        {expandedSections.coreDirection && (
          <div className="mt-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium hatchin-text mb-3">What are you building?</h4>
              <textarea 
                value={coreDirection.whatBuilding}
                onChange={(e) => updateCoreDirection('whatBuilding', e.target.value)}
                className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3"
                rows={3}
                placeholder="Describe the project in one clear sentence."
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium hatchin-text mb-3">Why does this matter?</h4>
              <textarea 
                value={coreDirection.whyMatters}
                onChange={(e) => updateCoreDirection('whyMatters', e.target.value)}
                className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3"
                rows={3}
                placeholder="What's the core purpose or motivation?"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium hatchin-text mb-3">Who is this for?</h4>
              <textarea 
                value={coreDirection.whoFor}
                onChange={(e) => updateCoreDirection('whoFor', e.target.value)}
                className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3"
                rows={3}
                placeholder="Who's the target audience, customer, or beneficiary?"
              />
            </div>
          </div>
        )}
      </div>
      {/* Execution Ground Rules - Collapsible Card */}
      <div className="hatchin-bg-card rounded-xl p-4 mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('executionRules')}
        >
          <div className="flex items-center gap-2">
            {expandedSections.executionRules ? 
              <ChevronDown className="w-4 h-4 hatchin-text-muted" /> : 
              <ChevronRight className="w-4 h-4 hatchin-text-muted" />
            }
            <h3 className="text-sm font-medium hatchin-text">Execution Ground Rules</h3>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSave('execution-rules', null);
            }}
            className={`text-sm hover:text-opacity-80 transition-all duration-200 flex items-center gap-1 ${
              recentlySaved.has('execution-rules') 
                ? 'text-green-400' 
                : 'hatchin-blue'
            }`}
          >
            {recentlySaved.has('execution-rules') ? (
              <>
                <Check className="w-3 h-3" />
                Saved
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
        
        {expandedSections.executionRules && (
          <div className="mt-4">
            <textarea 
              value={executionRules}
              onChange={(e) => updateExecutionRules(e.target.value)}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3"
              rows={4}
              placeholder="Define team principles, constraints, standards, deadlines, budget limits, and quality requirements that everyone must follow."
            />
          </div>
        )}
      </div>
      {/* Brand Guidelines & Team Culture - Collapsible Card */}
      <div className="hatchin-bg-card rounded-xl p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('brandCulture')}
        >
          <div className="flex items-center gap-2">
            {expandedSections.brandCulture ? 
              <ChevronDown className="w-4 h-4 hatchin-text-muted" /> : 
              <ChevronRight className="w-4 h-4 hatchin-text-muted" />
            }
            <h3 className="text-sm font-medium hatchin-text">Brand Guidelines & Culture</h3>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSave('team-culture', null);
            }}
            className={`text-sm hover:text-opacity-80 transition-all duration-200 flex items-center gap-1 ${
              recentlySaved.has('team-culture') 
                ? 'text-green-400' 
                : 'hatchin-blue'
            }`}
          >
            {recentlySaved.has('team-culture') ? (
              <>
                <Check className="w-3 h-3" />
                Saved
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
        
        {expandedSections.brandCulture && (
          <div className="mt-4">
            <textarea 
              value={teamCulture}
              onChange={(e) => updateTeamCulture(e.target.value)}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3"
              rows={4}
              placeholder="Define brand voice, communication style, design preferences, cultural values, and how the team should interact with users and each other."
            />
          </div>
        )}
      </div>
    </aside>
  );
}
