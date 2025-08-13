import * as React from "react";
import { Save, ChevronDown, ChevronRight, Check, Target, Brain } from "lucide-react";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { useToast } from "@/hooks/use-toast";
import { useRightSidebarState } from "@/hooks/useRightSidebarState";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import TaskManager from "./TaskManager";
import type { Project, Team, Agent } from "@shared/schema";

interface RightSidebarProps {
  activeProject: Project | undefined;
  activeTeam?: Team;
  activeAgent?: Agent;
}

export function RightSidebar({ activeProject, activeTeam, activeAgent }: RightSidebarProps) {
  const { toast } = useToast();
  const { state, actions } = useRightSidebarState(activeProject, activeTeam, activeAgent);
  
  // Local state for view switching
  const [currentView, setCurrentView] = React.useState<'overview' | 'tasks'>('overview');

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
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-medium">{activeAgent?.name?.charAt(0) || 'A'}</span>
          </div>
          <div>
            <h2 className="font-semibold hatchin-text text-[16px]">Hatch Profile</h2>
            <p className="text-xs hatchin-text-muted">{activeAgent?.name}</p>
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
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-medium">{activeTeam?.emoji || '👥'}</span>
          </div>
          <div>
            <h2 className="font-semibold hatchin-text text-[16px]">Team Dashboard</h2>
            <p className="text-xs hatchin-text-muted">{activeTeam?.name}</p>
          </div>
        </div>
        {/* Team Overview */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Team Overview</h3>
          
          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm hatchin-text">Overall Progress</span>
              <span className="text-sm font-semibold text-blue-400">68%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs hatchin-text-muted">17 of 25 tasks complete</span>
              <span className="text-xs hatchin-text-muted">8 tasks remaining</span>
            </div>
          </div>

          {/* Team Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/30 rounded-lg p-3 pt-[0px] pb-[0px] pl-[10px] pr-[10px]">
              <div className="text-lg font-bold hatchin-text">3</div>
              <div className="text-xs hatchin-text-muted">Team Members</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3 pl-[5px] pr-[5px] pt-[4px] pb-[4px]">
              <div className="text-lg font-bold text-green-400">{realTimeMetrics.taskCompletions || '17'}</div>
              <div className="text-xs hatchin-text-muted">Tasks Done</div>
            </div>
          </div>
        </div>
        {/* Team Goal - Always Visible */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold hatchin-text">Team Goal</h3>
            <button 
              onClick={() => handleSave('team-goal', null)}
              className={`text-sm hover:text-opacity-80 transition-all duration-200 flex items-center gap-1 ${
                recentlySaved.has('team-goal') 
                  ? 'text-green-400' 
                  : 'hatchin-blue'
              }`}
            >
              {recentlySaved.has('team-goal') ? (
                <>
                  <Check className="w-3 h-3" />
                  Saved
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
          
          <div className="mt-4">
            <textarea
              ref={(el) => {
                if (el) {
                  // Set initial height based on content
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }
              }}
              className="w-full hatchin-bg-card border border-gray-700 rounded-lg p-3 text-sm hatchin-text resize-none focus:outline-none focus:border-blue-500 transition-colors min-h-[80px] overflow-hidden bg-[#212327] pt-[5px] pb-[5px] mt-[0px] mb-[0px]"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              defaultValue="Complete the SaaS MVP with core features including user authentication, dashboard interface, and payment integration by end of Q2 2025."
              placeholder="Enter team goal..."
            />
          </div>
        </div>
        {/* Team Milestones - with collapsible tasks */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Team Milestones</h3>
          <div className="space-y-3">
            {/* Strategy Phase */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('strategyPhase')}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.strategyPhase ? 
                    <ChevronDown className="w-4 h-4 hatchin-text-muted" /> : 
                    <ChevronRight className="w-4 h-4 hatchin-text-muted" />
                  }
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-medium hatchin-text">Strategy Phase</span>
                </div>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30 text-left text-[12px] pl-[2px] pr-[2px]">
                  On Track
                </span>
              </div>
              <div className="text-xs hatchin-text-muted mb-2 mt-2">5 of 6 tasks complete • Due: Jun 5, 2025</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
              
              {expandedSections.strategyPhase && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">Market research analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">Competitive analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">User persona definition</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">Feature prioritization</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">MVP scope definition</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="hatchin-text-muted">Strategy documentation</span>
                  </div>
                </div>
              )}
            </div>

            {/* UI Polish */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('uiPolish')}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.uiPolish ? 
                    <ChevronDown className="w-4 h-4 hatchin-text-muted" /> : 
                    <ChevronRight className="w-4 h-4 hatchin-text-muted" />
                  }
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm font-medium hatchin-text">UI Polish</span>
                </div>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs border border-red-500/30">
                  At Risk
                </span>
              </div>
              <div className="text-xs hatchin-text-muted mb-2 mt-2">2 of 4 tasks complete • Due: Jun 8, 2025</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-3 h-3 text-yellow-400">⚠️</div>
                <span className="text-xs text-yellow-400">Needs attention: 2 tasks behind schedule</span>
              </div>
              
              {expandedSections.uiPolish && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">Design system setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="hatchin-text line-through">Component library</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="hatchin-text text-red-400">Responsive design</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="hatchin-text text-red-400">Accessibility audit</span>
                  </div>
                </div>
              )}
            </div>

            {/* MVP Release */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('mvpRelease')}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.mvpRelease ? 
                    <ChevronDown className="w-4 h-4 hatchin-text-muted" /> : 
                    <ChevronRight className="w-4 h-4 hatchin-text-muted" />
                  }
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium hatchin-text">MVP Release</span>
                </div>
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs border border-gray-500/30">
                  Upcoming
                </span>
              </div>
              <div className="text-xs hatchin-text-muted mb-2 mt-2">0 of 5 tasks complete • Due: Jun 15, 2025</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              
              {expandedSections.mvpRelease && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="hatchin-text-muted">Beta testing setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="hatchin-text-muted">Performance optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="hatchin-text-muted">Security audit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="hatchin-text-muted">Deployment pipeline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="hatchin-text-muted">Launch preparation</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Team Members Progress */}
        <div className="hatchin-bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Member Progress</h3>
          <div className="space-y-3">
            {[
              { name: 'Product Designer', role: 'Design Lead', tasksComplete: 6, totalTasks: 8, completion: 75 },
              { name: 'UI Engineer', role: 'Frontend Dev', tasksComplete: 8, totalTasks: 10, completion: 80 },
              { name: 'UX Researcher', role: 'Research', tasksComplete: 3, totalTasks: 7, completion: 43 }
            ].map((member, index) => (
              <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs hatchin-text font-medium">{member.name}</p>
                      <p className="text-xs hatchin-text-muted">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-xs hatchin-text">{member.tasksComplete}/{member.totalTasks}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${member.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Team Insights */}
        <div className="hatchin-bg-card rounded-xl p-4">
          <h3 className="text-sm font-semibold hatchin-text mb-4">Team Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Avg Response Time</span>
              <span className="text-xs hatchin-text">1.8s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Collaboration Rate</span>
              <span className="text-xs text-green-400">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Team Health</span>
              <span className="text-xs text-blue-400">Excellent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs hatchin-text-muted">Last Activity</span>
              <span className="text-xs hatchin-text">{realTimeMetrics.lastActivity.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="text-xs hatchin-text-muted leading-relaxed mb-3">
              Team shows excellent collaboration patterns with high-quality output. Strong dynamics with balanced participation from all members.
            </div>
            <div className="flex flex-wrap gap-1">
              {['High Collaboration', 'Fast Response', 'Quality Focus'].map((strength, index) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Project Overview View with Task Manager
  return (
    <aside className="w-80 hatchin-bg-panel rounded-2xl p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Brain className="w-3 h-3 text-white" />
        </div>
        <h2 className="font-semibold hatchin-text text-[16px]">Project Brain</h2>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-700/50">
        <button
          onClick={() => setCurrentView('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            currentView === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent hatchin-text-muted hover:hatchin-text'
          }`}
          data-testid="tab-overview"
        >
          <Brain className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setCurrentView('tasks')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            currentView === 'tasks'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent hatchin-text-muted hover:hatchin-text'
          }`}
          data-testid="tab-tasks"
        >
          <Target className="w-4 h-4" />
          Tasks
        </button>
      </div>

      {/* Content based on current view */}
      {currentView === 'tasks' ? (
        <>
          {/* Overall Progress Section */}
          <div className="hatchin-bg-card rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium hatchin-text">Overall Progress</h3>
              <span className="text-sm font-semibold text-blue-400">
                {Math.min(100, (activeProject?.progress || 0) + realTimeProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (activeProject?.progress || 0) + realTimeProgress)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs hatchin-text-muted">
              <span>Project timeline on track</span>
              <span>{realTimeMetrics.taskCompletions > 0 ? `+${realTimeMetrics.taskCompletions} tasks` : ''}</span>
            </div>
          </div>
          
          <div className="-mx-6 px-6">
            <TaskManager 
              projectId={activeProject?.id || ''}
              teamId={activeTeam?.id}
              agentId={activeAgent?.id}
              isConnected={isConnected}
            />
          </div>
        </>
      ) : (
        <>
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
            />
          </div>
          
          <div className="text-xs hatchin-text-muted leading-relaxed">
            Expected effort: ~18 hours/week from user.<br/>
            This timeline is estimated based on project complexity, goals, and required work hours.<br/>
            You can request changes through chat or edit it manually if needed.
          </div>
        </div>
      </div>
      {/* Core Direction - Always Visible */}
      <div className="hatchin-bg-card rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium hatchin-text">Core Direction</h3>
          <button 
            onClick={() => handleSave('core-direction', null)}
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
        
        <div className="mt-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium hatchin-text mb-3">What are you building?</h4>
            <textarea 
              value={coreDirection.whatBuilding}
              onChange={(e) => updateCoreDirection('whatBuilding', e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3 min-h-[80px] overflow-hidden"
              style={{ height: 'auto' }}
              placeholder="Describe the project in one clear sentence."
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium hatchin-text mb-3">Why does this matter?</h4>
            <textarea 
              value={coreDirection.whyMatters}
              onChange={(e) => updateCoreDirection('whyMatters', e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3 min-h-[80px] overflow-hidden"
              style={{ height: 'auto' }}
              placeholder="What's the core purpose or motivation?"
            />
          </div>

          <div>
            <h4 className="text-sm font-medium hatchin-text mb-3">Who is this for?</h4>
            <textarea 
              value={coreDirection.whoFor}
              onChange={(e) => updateCoreDirection('whoFor', e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3 min-h-[80px] overflow-hidden"
              style={{ height: 'auto' }}
              placeholder="Who's the target audience, customer, or beneficiary?"
            />
          </div>
        </div>
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
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3 min-h-[100px] overflow-hidden"
              style={{ height: 'auto' }}
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
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              className="w-full hatchin-text placeholder-hatchin-text-muted resize-none focus:outline-none text-sm bg-[#212327] rounded-lg p-3 min-h-[100px] overflow-hidden"
              style={{ height: 'auto' }}
              placeholder="Define brand voice, communication style, design preferences, cultural values, and how the team should interact with users and each other."
            />
          </div>
        )}
      </div>
        </>
      )}
    </aside>
  );
}
