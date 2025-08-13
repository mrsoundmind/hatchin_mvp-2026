import React, { useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Flag,
  Target,
  TrendingUp
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
  projectId: string;
  teamId?: string;
  estimatedHours?: number;
  actualHours?: number;
}

interface TaskSection {
  id: string;
  title: string;
  tasks: Task[];
  collapsed: boolean;
}

interface TaskManagerProps {
  projectId: string;
  teamId?: string;
  agentId?: string;
  isConnected: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ 
  projectId, 
  teamId, 
  agentId, 
  isConnected 
}) => {
  // Sample task data - in production this would come from API/state
  const [sections, setSections] = useState<TaskSection[]>([
    {
      id: 'urgent',
      title: 'Urgent Tasks',
      collapsed: false,
      tasks: [
        {
          id: 'task-1',
          title: 'Fix authentication bug',
          description: 'Users cannot log in with Google OAuth',
          status: 'in_progress',
          priority: 'urgent',
          assignee: 'Backend Developer',
          dueDate: '2025-08-14',
          createdAt: '2025-08-13T09:00:00Z',
          tags: ['bug', 'auth', 'critical'],
          projectId,
          estimatedHours: 4,
          actualHours: 2.5
        },
        {
          id: 'task-2',
          title: 'Deploy hotfix to production',
          status: 'todo',
          priority: 'urgent',
          assignee: 'Backend Developer',
          dueDate: '2025-08-14',
          createdAt: '2025-08-13T10:30:00Z',
          tags: ['deployment', 'hotfix'],
          projectId,
          estimatedHours: 1
        }
      ]
    },
    {
      id: 'today',
      title: 'Due Today',
      collapsed: false,
      tasks: [
        {
          id: 'task-3',
          title: 'Complete user dashboard wireframes',
          status: 'in_progress',
          priority: 'high',
          assignee: 'Product Designer',
          dueDate: '2025-08-13',
          createdAt: '2025-08-12T14:00:00Z',
          tags: ['design', 'wireframes'],
          projectId,
          estimatedHours: 6,
          actualHours: 4
        },
        {
          id: 'task-4',
          title: 'Write API documentation',
          status: 'todo',
          priority: 'medium',
          assignee: 'Backend Developer',
          dueDate: '2025-08-13',
          createdAt: '2025-08-12T16:00:00Z',
          tags: ['documentation', 'api'],
          projectId,
          estimatedHours: 3
        }
      ]
    },
    {
      id: 'this_week',
      title: 'This Week',
      collapsed: true,
      tasks: [
        {
          id: 'task-5',
          title: 'Implement user settings page',
          status: 'todo',
          priority: 'medium',
          assignee: 'UI Engineer',
          dueDate: '2025-08-15',
          createdAt: '2025-08-12T11:00:00Z',
          tags: ['frontend', 'settings'],
          projectId,
          estimatedHours: 8
        },
        {
          id: 'task-6',
          title: 'Set up monitoring dashboard',
          status: 'todo',
          priority: 'low',
          assignee: 'Backend Developer',
          dueDate: '2025-08-16',
          createdAt: '2025-08-12T09:00:00Z',
          tags: ['monitoring', 'infrastructure'],
          projectId,
          estimatedHours: 4
        }
      ]
    },
    {
      id: 'completed',
      title: 'Recently Completed',
      collapsed: true,
      tasks: [
        {
          id: 'task-7',
          title: 'Setup project repository',
          status: 'completed',
          priority: 'high',
          assignee: 'Backend Developer',
          createdAt: '2025-08-11T09:00:00Z',
          completedAt: '2025-08-11T11:30:00Z',
          tags: ['setup', 'infrastructure'],
          projectId,
          estimatedHours: 2,
          actualHours: 2.5
        }
      ]
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, collapsed: !section.collapsed }
        : section
    ));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setSections(prev => prev.map(section => ({
      ...section,
      tasks: section.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: task.status === 'completed' ? 'todo' : 'completed',
              completedAt: task.status !== 'completed' ? new Date().toISOString() : undefined
            }
          : task
      )
    })));
  }, []);

  const addNewTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      tags: [],
      projectId
    };

    setSections(prev => prev.map(section => 
      section.id === 'today' 
        ? { ...section, tasks: [newTask, ...section.tasks] }
        : section
    ));

    setNewTaskTitle('');
    setShowNewTaskForm(false);
  }, [newTaskTitle, projectId]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 border-red-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: Task['status'], priority: Task['priority']) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
    if (status === 'blocked') {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    return <Circle className={`w-4 h-4 ${getPriorityColor(priority)}`} />;
  };

  const getTotalTasks = () => {
    return sections.reduce((total, section) => total + section.tasks.length, 0);
  };

  const getCompletedTasks = () => {
    return sections.reduce((total, section) => 
      total + section.tasks.filter(task => task.status === 'completed').length, 0
    );
  };

  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return sections.reduce((total, section) => 
      total + section.tasks.filter(task => 
        task.dueDate && task.dueDate < today && task.status !== 'completed'
      ).length, 0
    );
  };

  return (
    <div className="hatchin-bg-card rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold hatchin-text">Task Manager</h3>
          {isConnected && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
          data-testid="button-add-task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="hatchin-bg-panel rounded-lg p-2 text-center">
          <div className="text-lg font-semibold hatchin-text">{getTotalTasks()}</div>
          <div className="text-xs hatchin-text-muted">Total</div>
        </div>
        <div className="hatchin-bg-panel rounded-lg p-2 text-center">
          <div className="text-lg font-semibold text-green-400">{getCompletedTasks()}</div>
          <div className="text-xs hatchin-text-muted">Done</div>
        </div>
        <div className="hatchin-bg-panel rounded-lg p-2 text-center">
          <div className="text-lg font-semibold text-red-400">{getOverdueTasks()}</div>
          <div className="text-xs hatchin-text-muted">Overdue</div>
        </div>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-transparent border-none outline-none hatchin-text text-sm mb-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addNewTask();
              }
              if (e.key === 'Escape') {
                setShowNewTaskForm(false);
                setNewTaskTitle('');
              }
            }}
            autoFocus
            data-testid="input-new-task"
          />
          <div className="flex gap-2">
            <button
              onClick={addNewTask}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              data-testid="button-save-task"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setShowNewTaskForm(false);
                setNewTaskTitle('');
              }}
              className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
              data-testid="button-cancel-task"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleSection(section.id)}
              data-testid={`section-${section.id}`}
            >
              <div className="flex items-center gap-2">
                {section.collapsed ? (
                  <ChevronRight className="w-4 h-4 hatchin-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 hatchin-text-muted" />
                )}
                <span className="text-sm font-medium hatchin-text">{section.title}</span>
                <span className="text-xs hatchin-text-muted bg-gray-700 px-2 py-0.5 rounded-full">
                  {section.tasks.length}
                </span>
              </div>
            </div>

            {!section.collapsed && (
              <div className="space-y-2 ml-6">
                {section.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors"
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 hover:scale-110 transition-transform"
                        data-testid={`toggle-task-${task.id}`}
                      >
                        {getStatusIcon(task.status, task.priority)}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium break-words ${
                            task.status === 'completed' 
                              ? 'line-through hatchin-text-muted' 
                              : 'hatchin-text'
                          }`}>
                            {task.title}
                          </h4>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <MoreHorizontal className="w-4 h-4 hatchin-text-muted" />
                          </button>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs hatchin-text-muted mt-1 break-words">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 hatchin-text-muted" />
                              <span className="text-xs hatchin-text-muted truncate">{task.assignee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {section.tasks.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-xs hatchin-text-muted">No tasks in this section</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>


    </div>
  );
};

export default TaskManager;