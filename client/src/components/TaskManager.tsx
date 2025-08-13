import React, { useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  User, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Target,
  GripVertical
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
  // Sample task data - simplified structure with only Urgent Tasks and Tasks
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
          dueDate: '2025-08-13',
          createdAt: '2025-08-13T08:00:00Z',
          tags: ['bug', 'auth'],
          projectId
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
          projectId
        }
      ]
    },
    {
      id: 'tasks',
      title: 'Tasks',
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
          projectId
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
          projectId
        },
        {
          id: 'task-5',
          title: 'Implement user settings page',
          status: 'todo',
          priority: 'medium',
          assignee: 'UI Engineer',
          dueDate: '2025-08-15',
          createdAt: '2025-08-12T11:00:00Z',
          tags: ['frontend', 'settings'],
          projectId
        },
        {
          id: 'task-6',
          title: 'Set up monitoring dashboard',
          status: 'completed',
          priority: 'low',
          assignee: 'Backend Developer',
          dueDate: '2025-08-16',
          createdAt: '2025-08-12T09:00:00Z',
          completedAt: '2025-08-12T17:00:00Z',
          tags: ['monitoring', 'infrastructure'],
          projectId
        }
      ]
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

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

  const deleteTask = useCallback((taskId: string) => {
    setSections(prev => prev.map(section => ({
      ...section,
      tasks: section.tasks.filter(task => task.id !== taskId)
    })));
  }, []);

  const addNewTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    // Smart assignment based on task content
    const getSmartAssignee = (title: string) => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('design') || lowerTitle.includes('wireframe') || lowerTitle.includes('ui')) {
        return 'Product Designer';
      } else if (lowerTitle.includes('backend') || lowerTitle.includes('api') || lowerTitle.includes('database')) {
        return 'Backend Developer';
      } else if (lowerTitle.includes('frontend') || lowerTitle.includes('component') || lowerTitle.includes('interface')) {
        return 'UI Engineer';
      } else if (lowerTitle.includes('test') || lowerTitle.includes('qa') || lowerTitle.includes('bug')) {
        return 'QA Lead';
      } else if (lowerTitle.includes('product') || lowerTitle.includes('feature') || lowerTitle.includes('requirement')) {
        return 'Product Manager';
      }
      return 'Backend Developer'; // Default fallback
    };

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      tags: [],
      projectId,
      teamId,
      assignee: getSmartAssignee(newTaskTitle)
    };

    // Add to regular tasks section by default
    setSections(prev => prev.map(section => 
      section.id === 'tasks'
        ? { ...section, tasks: [...section.tasks, newTask] }
        : section
    ));

    setNewTaskTitle('');
    setShowNewTaskForm(false);
  }, [newTaskTitle, projectId, teamId]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    setDragOverSection(null);
    
    if (!draggedTask) return;

    // Find and move the task
    let taskToMove: Task | null = null;
    setSections(prev => {
      const newSections = prev.map(section => ({
        ...section,
        tasks: section.tasks.filter(task => {
          if (task.id === draggedTask) {
            taskToMove = task;
            return false;
          }
          return true;
        })
      }));

      // Add task to target section
      if (taskToMove) {
        return newSections.map(section => 
          section.id === targetSectionId
            ? { ...section, tasks: [...section.tasks, taskToMove!] }
            : section
        );
      }

      return newSections;
    });

    setDraggedTask(null);
  };

  const getStatusIcon = (status: Task['status']) => {
    if (status === 'completed') {
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
    
    return <Circle className="w-4 h-4 hatchin-text-muted" />;
  };



  const getTotalTasks = () => {
    return sections.reduce((total, section) => total + section.tasks.length, 0);
  };

  const getCompletedTasks = () => {
    return sections.reduce(
      (total, section) => total + section.tasks.filter(task => task.status === 'completed').length, 0
    );
  };

  // Remove getPriorityColor function as we're removing the colored borders
  const getCompletedSection = () => {
    const completedTasks = sections.reduce((acc, section) => {
      return [...acc, ...section.tasks.filter(task => task.status === 'completed')];
    }, [] as Task[]);
    
    return {
      id: 'completed',
      title: 'Completed',
      collapsed: false,
      tasks: completedTasks
    };
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold hatchin-text">Task Manager</h3>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-400/10 rounded-lg"
          data-testid="button-add-task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {/* Quick Stats - Only Total and Done */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="hatchin-bg-panel rounded-lg p-2.5 text-center">
          <div className="text-lg font-semibold hatchin-text">{getTotalTasks()}</div>
          <div className="text-xs hatchin-text-muted">Total</div>
        </div>
        <div className="hatchin-bg-panel rounded-lg p-2.5 text-center">
          <div className="text-lg font-semibold text-green-400">{getCompletedTasks()}</div>
          <div className="text-xs hatchin-text-muted">Done</div>
        </div>
      </div>
      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-transparent border-none outline-none hatchin-text text-sm mb-3"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              data-testid="button-save-task"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setShowNewTaskForm(false);
                setNewTaskTitle('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
              data-testid="button-cancel-task"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Task Sections */}
      <div className="space-y-4">
        {[...sections, getCompletedSection()].map((section) => (
          <div key={section.id} className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer group py-1"
              onClick={() => toggleSection(section.id)}
              data-testid={`section-${section.id}`}
            >
              <div className="flex items-center gap-3">
                {section.collapsed ? (
                  <ChevronRight className="w-4 h-4 hatchin-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 hatchin-text-muted" />
                )}
                <span className="text-base font-medium hatchin-text">{section.title}</span>
                <span className="text-sm hatchin-text-muted bg-gray-700 px-2 py-1 rounded-full">
                  {section.tasks.length}
                </span>
              </div>
            </div>

            {!section.collapsed && (
              <div 
                className={`space-y-3 min-h-[60px] rounded-lg transition-all ${
                  dragOverSection === section.id ? 'bg-blue-500/10 border-2 border-blue-400/50' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, section.id)}
              >
                {section.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable={section.id !== 'completed'}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`group bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-all ${
                      section.id !== 'completed' ? 'cursor-move' : 'cursor-default'
                    }`}
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3">
                        {section.id !== 'completed' && (
                          <GripVertical className="w-4 h-4 hatchin-text-muted opacity-50" />
                        )}
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="hover:scale-110 transition-transform"
                          data-testid={`toggle-task-${task.id}`}
                        >
                          {getStatusIcon(task.status)}
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className={`text-sm font-medium break-words leading-relaxed ${
                            task.status === 'completed' 
                              ? 'line-through hatchin-text-muted' 
                              : 'hatchin-text'
                          }`}>
                            {task.title}
                          </h4>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                            data-testid={`delete-task-${task.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        

                        
                        {task.assignee && (
                          <div className="flex items-center gap-2 mt-2">
                            <User className="w-3 h-3 hatchin-text-muted" />
                            <span className="text-xs hatchin-text-muted">{task.assignee}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {section.tasks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm hatchin-text-muted">
                      {dragOverSection === section.id ? 'Drop task here' : 'No tasks in this section'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default TaskManager;