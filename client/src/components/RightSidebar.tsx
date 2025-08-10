import * as React from "react";
import { X, Save, ChevronDown, ChevronRight, Check, Wifi, WifiOff } from "lucide-react";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { useToast } from "@/hooks/use-toast";
import { useRightSidebarState } from "@/hooks/useRightSidebarState";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import type { Project, Team, Agent } from "@shared/schema";

interface RightSidebarProps {
  activeProject: Project | undefined;
  activeTeam?: Team;
  activeAgent?: Agent;
}

export function RightSidebar({ activeProject, activeTeam, activeAgent }: RightSidebarProps) {
  const { toast } = useToast();
  const { state, actions } = useRightSidebarState(activeProject, activeTeam, activeAgent);

  // Real-time updates for sidebar data
  const [realTimeProgress, setRealTimeProgress] = React.useState(0);
  const [realTimeTimeline, setRealTimeTimeline] = React.useState<Array<any>>([]);
  const [realTimeMetrics, setRealTimeMetrics] = React.useState({
    messagesCount: 0,
    lastActivity: new Date(),
    activeParticipants: [] as string[],
    taskCompletions: 0,
    milestoneReaches: 0,
  });

  // Set up real-time updates
  const { connectionStatus, isConnected } = useRealTimeUpdates({
    activeProject,
    activeTeam,
    activeAgent,
    onMetricsUpdate: (metrics) => {
      setRealTimeMetrics(metrics);
      console.log('📊 Right sidebar metrics updated:', metrics);
    },
    onProgressUpdate: (progressDelta) => {
      setRealTimeProgress(prev => Math.min(100, prev + progressDelta));
      console.log('📈 Progress updated by:', progressDelta);
    },
    onTimelineUpdate: (event) => {
      setRealTimeTimeline(prev => [event, ...prev].slice(0, 10)); // Keep last 10 events
      console.log('📅 Timeline updated:', event);
    },
    debounceMs: 500
  });

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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-medium">{activeAgent?.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <h2 className="font-semibold hatchin-text text-[16px]">Hatch Profile</h2>
              <p className="text-xs hatchin-text-muted">{activeAgent?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" title="Real-time updates connected" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" title="Real-time updates disconnected" />
            )}
            <button className="hatchin-text-muted hover:text-hatchin-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Agent Status Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-3 mb-6 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm hatchin-text font-medium">Active</span>
            </div>
            <span className="text-xs hatchin-text-muted">{activeAgent?.role}</span>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold hatchin-text">Performance Overview</h3>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
            )}
          </div>
          
          {/* Performance Score Circle */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2.51 * 85} ${2.51 * 100}`}
                  className="text-emerald-400"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold hatchin-text">85</div>
                  <div className="text-xs hatchin-text-muted">Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-lg font-bold hatchin-text">{realTimeMetrics.messagesCount > 0 ? realTimeMetrics.messagesCount : '127'}</div>
              <div className="text-xs hatchin-text-muted">Messages</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">{realTimeMetrics.taskCompletions}</div>
              <div className="text-xs hatchin-text-muted">Tasks Done</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-lg font-bold hatchin-text">2.3s</div>
              <div className="text-xs hatchin-text-muted">Avg Response</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-400">94%</div>
              <div className="text-xs hatchin-text-muted">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Skills & Expertise */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Skills & Expertise</h3>
          <div className="space-y-3">
            {/* Skill bars */}
            {[
              { skill: 'Communication', level: 92, color: 'bg-blue-400' },
              { skill: 'Problem Solving', level: 88, color: 'bg-emerald-400' },
              { skill: 'Technical Knowledge', level: 85, color: 'bg-purple-400' },
              { skill: 'Collaboration', level: 90, color: 'bg-yellow-400' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs hatchin-text-muted">{item.skill}</span>
                  <span className="text-xs hatchin-text">{item.level}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${item.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs hatchin-text">Completed design review</p>
                <p className="text-xs hatchin-text-muted">{realTimeMetrics.lastActivity.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs hatchin-text">Sent progress update</p>
                <p className="text-xs hatchin-text-muted">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs hatchin-text">Joined team discussion</p>
                <p className="text-xs hatchin-text-muted">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Development Insights */}
        <div className="hatchin-bg-card rounded-xl p-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Development Insights</h3>
          <div className="text-xs hatchin-text-muted leading-relaxed mb-3">
            {activeAgent?.name} excels in {activeAgent?.role.toLowerCase()} tasks with strong analytical thinking 
            and clear communication. Recent performance shows consistent improvement in problem-solving speed.
          </div>
          <div className="flex flex-wrap gap-1">
            {['Strategic', 'Analytical', 'Collaborative', 'Detail-oriented'].map((trait, index) => (
              <span key={index} className="px-2 py-1 bg-gray-700/50 rounded text-xs hatchin-text-muted">
                {trait}
              </span>
            ))}
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-medium">{activeTeam?.emoji || '👥'}</span>
            </div>
            <div>
              <h2 className="font-semibold hatchin-text text-[16px]">Team Dashboard</h2>
              <p className="text-xs hatchin-text-muted">{activeTeam?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" title="Real-time updates connected" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" title="Real-time updates disconnected" />
            )}
            <button className="hatchin-text-muted hover:text-hatchin-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Team Status Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 mb-6 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm hatchin-text font-medium">Active Team</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs hatchin-text-muted">{realTimeMetrics.activeParticipants.length > 0 ? realTimeMetrics.activeParticipants.length : '3'} members online</span>
            </div>
          </div>
        </div>

        {/* Team Performance Overview */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold hatchin-text">Performance Overview</h3>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
            )}
          </div>
          
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-3 border border-blue-500/20">
              <div className="text-xl font-bold hatchin-text">{realTimeMetrics.messagesCount > 0 ? realTimeMetrics.messagesCount : '45'}</div>
              <div className="text-xs hatchin-text-muted">Messages Today</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 border border-green-500/20">
              <div className="text-xl font-bold text-green-400">{realTimeMetrics.taskCompletions}</div>
              <div className="text-xs hatchin-text-muted">Tasks Complete</div>
            </div>
          </div>

          {/* Team Health Score */}
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm hatchin-text">Team Health</span>
              <span className="text-sm font-semibold text-green-400">92%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Team Members</h3>
          <div className="space-y-3">
            {[
              { name: 'Product Designer', role: 'Design Lead', status: 'active', performance: 94 },
              { name: 'UI Engineer', role: 'Frontend Dev', status: 'active', performance: 88 },
              { name: 'UX Researcher', role: 'Research', status: 'away', performance: 91 }
            ].map((member, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs hatchin-text font-medium">{member.name}</p>
                    <p className="text-xs hatchin-text-muted">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs hatchin-text">{member.performance}%</span>
                  <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collaboration Insights */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Collaboration Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Avg Response Time</span>
              <span className="text-xs hatchin-text">1.8s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Sync Rate</span>
              <span className="text-xs text-green-400">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Cross-team Collab</span>
              <span className="text-xs text-blue-400">High</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Last Activity</span>
              <span className="text-xs hatchin-text">{realTimeMetrics.lastActivity.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Recent Team Activity */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <p className="text-xs hatchin-text">Design review completed</p>
                <p className="text-xs hatchin-text-muted">Team collaboration • 2h ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <p className="text-xs hatchin-text">Sprint planning session</p>
                <p className="text-xs hatchin-text-muted">All members participated • 4h ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <p className="text-xs hatchin-text">Feature prototype shared</p>
                <p className="text-xs hatchin-text-muted">Cross-team feedback • 6h ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Analytics */}
        <div className="hatchin-bg-card rounded-xl p-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Team Analytics</h3>
          <div className="text-xs hatchin-text-muted leading-relaxed mb-3">
            {activeTeam?.name} shows excellent collaboration patterns with consistent high-quality output. 
            Team dynamics are strong with balanced participation from all members.
          </div>
          <div className="flex flex-wrap gap-1">
            {['High Collaboration', 'Fast Response', 'Quality Focus', 'Innovation'].map((strength, index) => (
              <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                {strength}
              </span>
            ))}
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
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-400" title="Real-time updates connected" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-500" title="Real-time updates disconnected" />
          )}
          <button className="hatchin-text-muted hover:text-hatchin-text">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="hatchin-text-muted text-[12px] mb-6">
        A shared brain for your team to stay aligned.
      </p>
      {/* Project Progress */}
      <div className="mt-[18px] mb-[18px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium hatchin-text">Project Progress</h3>
          {isConnected && realTimeProgress > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>
        
        <div className="hatchin-bg-card rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="hatchin-text-muted text-[12px]">
              Time spent: {activeProject?.timeSpent || '0 hours'}
            </span>
            <span className="hatchin-text text-[#1cd979] font-bold text-[12px]">
              {Math.min(100, (activeProject?.progress || 0) + realTimeProgress)}% complete
            </span>
          </div>
          
          <div className="mb-4">
            <div className="hatchin-text-muted mb-2 text-[12px] flex justify-between">
              <span>2.5 weeks — 3 working phases</span>
              {realTimeMetrics.taskCompletions > 0 && (
                <span className="text-green-400">+{realTimeMetrics.taskCompletions} tasks</span>
              )}
            </div>
            
            <ProgressTimeline 
              progress={Math.min(100, (activeProject?.progress || 0) + realTimeProgress)}
              recentEvents={realTimeTimeline.slice(0, 5)}
            />
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
