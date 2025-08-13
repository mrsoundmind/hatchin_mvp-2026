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
import type { Task } from '@shared/schema';

interface HierarchicalTask extends Task {
  subtasks?: HierarchicalTask[];
  isExpanded?: boolean;
}

interface TaskSection {
  id: string;
  title: string;
  tasks: HierarchicalTask[];
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
          status: 'in_progress',
          priority: 'urgent',
          assignee: 'Backend Developer',
          dueDate: new Date('2025-08-13'),
          createdAt: new Date('2025-08-13T08:00:00Z'),
          updatedAt: new Date('2025-08-13T08:00:00Z'),
          tags: ['bug', 'auth'],
          projectId,
          teamId: teamId || null,
          parentTaskId: null
        },
        {
          id: 'task-2',
          title: 'Deploy hotfix to production',
          status: 'todo',
          priority: 'urgent',
          assignee: 'Backend Developer',
          dueDate: new Date('2025-08-14'),
          createdAt: new Date('2025-08-13T10:30:00Z'),
          updatedAt: new Date('2025-08-13T10:30:00Z'),
          tags: ['deployment', 'hotfix'],
          projectId,
          teamId: teamId || null,
          parentTaskId: null
        }
      ]
    },
    {
      id: 'team-tasks',
      title: 'All Team Tasks',
      collapsed: false,
      tasks: [
        {
          id: 'task-3',
          title: 'User Dashboard Design System',
          status: 'in_progress',
          priority: 'high',
          assignee: 'Product Designer',
          dueDate: new Date('2025-08-20'),
          createdAt: new Date('2025-08-10T14:00:00Z'),
          updatedAt: new Date('2025-08-12T14:00:00Z'),
          tags: ['design', 'wireframes'],
          projectId,
          teamId: teamId || null,
          parentTaskId: null,
          isExpanded: true,
          subtasks: [
            {
              id: 'task-3-1',
              title: 'Create wireframes for main dashboard',
              status: 'completed',
              priority: 'high',
              assignee: 'Product Designer',
              createdAt: new Date('2025-08-10'),
              updatedAt: new Date('2025-08-11'),
              completedAt: new Date('2025-08-11'),
              tags: ['wireframes'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-3'
            },
            {
              id: 'task-3-2',
              title: 'Design component library',
              status: 'in_progress',
              priority: 'medium',
              assignee: 'Product Designer',
              createdAt: new Date('2025-08-11'),
              updatedAt: new Date('2025-08-12'),
              tags: ['components', 'library'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-3'
            },
            {
              id: 'task-3-3',
              title: 'User testing feedback integration',
              status: 'todo',
              priority: 'medium',
              assignee: 'Product Designer',
              createdAt: new Date('2025-08-12'),
              updatedAt: new Date('2025-08-12'),
              tags: ['testing', 'feedback'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-3'
            }
          ]
        },
        {
          id: 'task-4',
          title: 'API Development & Documentation',
          status: 'in_progress',
          priority: 'high',
          assignee: 'Backend Developer',
          dueDate: new Date('2025-08-25'),
          createdAt: new Date('2025-08-08T16:00:00Z'),
          updatedAt: new Date('2025-08-13T16:00:00Z'),
          tags: ['api', 'backend'],
          projectId,
          teamId: teamId || null,
          parentTaskId: null,
          isExpanded: false,
          subtasks: [
            {
              id: 'task-4-1',
              title: 'Design RESTful API endpoints',
              status: 'completed',
              priority: 'high',
              assignee: 'Backend Developer',
              createdAt: new Date('2025-08-08'),
              updatedAt: new Date('2025-08-09'),
              completedAt: new Date('2025-08-09'),
              tags: ['api', 'design'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-4'
            },
            {
              id: 'task-4-2',
              title: 'Implement user management endpoints',
              status: 'in_progress',
              priority: 'high',
              assignee: 'Backend Developer',
              createdAt: new Date('2025-08-09'),
              updatedAt: new Date('2025-08-13'),
              tags: ['users', 'endpoints'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-4'
            },
            {
              id: 'task-4-3',
              title: 'Write comprehensive API documentation',
              status: 'todo',
              priority: 'medium',
              assignee: 'Backend Developer',
              createdAt: new Date('2025-08-12'),
              updatedAt: new Date('2025-08-12'),
              tags: ['documentation'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-4'
            }
          ]
        },
        {
          id: 'task-5',
          title: 'Frontend User Interface',
          status: 'todo',
          priority: 'medium',
          assignee: 'UI Engineer',
          dueDate: new Date('2025-08-30'),
          createdAt: new Date('2025-08-12T11:00:00Z'),
          updatedAt: new Date('2025-08-12T11:00:00Z'),
          tags: ['frontend', 'ui'],
          projectId,
          teamId: teamId || null,
          parentTaskId: null,
          isExpanded: false,
          subtasks: [
            {
              id: 'task-5-1',
              title: 'Set up React project structure',
              status: 'completed',
              priority: 'high',
              assignee: 'UI Engineer',
              createdAt: new Date('2025-08-12'),
              updatedAt: new Date('2025-08-12'),
              completedAt: new Date('2025-08-12'),
              tags: ['setup', 'react'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-5'
            },
            {
              id: 'task-5-2',
              title: 'Implement user settings page',
              status: 'todo',
              priority: 'medium',
              assignee: 'UI Engineer',
              createdAt: new Date('2025-08-12'),
              updatedAt: new Date('2025-08-12'),
              tags: ['settings', 'page'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-5'
            },
            {
              id: 'task-5-3',
              title: 'Build responsive navigation',
              status: 'todo',
              priority: 'medium',
              assignee: 'UI Engineer',
              createdAt: new Date('2025-08-12'),
              updatedAt: new Date('2025-08-12'),
              tags: ['navigation', 'responsive'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-5'
            }
          ]
        }
      ]
    },
    {
      id: 'completed',
      title: 'Completed Tasks',
      collapsed: true,
      tasks: [
        {
          id: 'task-6',
          title: 'Project Setup & Infrastructure',
          status: 'completed',
          priority: 'high',
          assignee: 'Backend Developer',
          dueDate: new Date('2025-08-10'),
          createdAt: new Date('2025-08-05T09:00:00Z'),
          updatedAt: new Date('2025-08-08T17:00:00Z'),
          completedAt: new Date('2025-08-08T17:00:00Z'),
          tags: ['setup', 'infrastructure'],
          projectId,
          teamId: teamId || null,
          parentTaskId: null,
          isExpanded: false,
          subtasks: [
            {
              id: 'task-6-1',
              title: 'Set up development environment',
              status: 'completed',
              priority: 'high',
              assignee: 'Backend Developer',
              createdAt: new Date('2025-08-05'),
              updatedAt: new Date('2025-08-06'),
              completedAt: new Date('2025-08-06'),
              tags: ['environment'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-6'
            },
            {
              id: 'task-6-2',
              title: 'Configure monitoring dashboard',
              status: 'completed',
              priority: 'medium',
              assignee: 'Backend Developer',
              createdAt: new Date('2025-08-07'),
              updatedAt: new Date('2025-08-08'),
              completedAt: new Date('2025-08-08'),
              tags: ['monitoring'],
              projectId,
              teamId: teamId || null,
              parentTaskId: 'task-6'
            }
          ]
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
    const updateTaskRecursively = (tasks: HierarchicalTask[]): HierarchicalTask[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === 'completed' ? 'todo' : 'completed',
            completedAt: task.status === 'completed' ? undefined : new Date(),
            updatedAt: new Date()
          };
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: updateTaskRecursively(task.subtasks)
          };
        }
        return task;
      });
    };

    setSections(prev => prev.map(section => ({
      ...section,
      tasks: updateTaskRecursively(section.tasks)
    })));
  }, []);

  const toggleTaskExpansion = useCallback((taskId: string) => {
    const updateTaskRecursively = (tasks: HierarchicalTask[]): HierarchicalTask[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            isExpanded: !task.isExpanded
          };
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: updateTaskRecursively(task.subtasks)
          };
        }
        return task;
      });
    };

    setSections(prev => prev.map(section => ({
      ...section,
      tasks: updateTaskRecursively(section.tasks)
    })));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    const deleteTaskRecursively = (tasks: HierarchicalTask[]): HierarchicalTask[] => {
      return tasks.filter(task => {
        if (task.id === taskId) {
          return false; // Remove this task
        }
        if (task.subtasks) {
          task.subtasks = deleteTaskRecursively(task.subtasks);
        }
        return true;
      });
    };

    setSections(prev => prev.map(section => ({
      ...section,
      tasks: deleteTaskRecursively(section.tasks)
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

    const newTask: HierarchicalTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: 'todo',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      projectId,
      teamId: teamId || null,
      parentTaskId: null,
      assignee: getSmartAssignee(newTaskTitle),
      isExpanded: false,
      subtasks: []
    };

    // Add to team tasks section by default
    setSections(prev => prev.map(section => 
      section.id === 'team-tasks'
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

  // Recursive function to render tasks with subtasks
  const renderTask = (task: HierarchicalTask, level: number = 0, sectionId: string) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const indent = level > 0 ? `ml-${level * 6}` : '';
    
    return (
      <div key={task.id} className={`${indent} ${level > 0 ? 'border-l border-gray-600 pl-4' : ''}`}>
        <div
          draggable={sectionId !== 'completed'}
          onDragStart={(e) => handleDragStart(e, task.id)}
          className="group rounded-lg p-3 hover:bg-gray-800/60 transition-all cursor-move bg-[#33373d] mb-2"
          data-testid={`task-${task.id}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              {sectionId !== 'completed' && level === 0 && (
                <GripVertical className="w-4 h-4 hatchin-text-muted opacity-50" />
              )}
              
              {hasSubtasks && (
                <button
                  onClick={() => toggleTaskExpansion(task.id)}
                  className="hover:scale-110 transition-transform"
                  data-testid={`expand-task-${task.id}`}
                >
                  {task.isExpanded ? (
                    <ChevronDown className="w-4 h-4 hatchin-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 hatchin-text-muted" />
                  )}
                </button>
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
              <div className="flex items-center justify-between">
                <h4 className={`font-medium hatchin-text text-sm break-words flex-1 mr-3 ${
                  task.status === 'completed' ? 'line-through opacity-60' : ''
                }`}>
                  {task.title}
                </h4>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                    data-testid={`delete-task-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
        
        {/* Render subtasks if expanded */}
        {hasSubtasks && task.isExpanded && (
          <div className="mt-2 space-y-1">
            {task.subtasks!.map((subtask) => renderTask(subtask, level + 1, sectionId))}
          </div>
        )}
      </div>
    );
  };



  const countTasksRecursively = (tasks: HierarchicalTask[]): { total: number; completed: number } => {
    let total = 0;
    let completed = 0;

    tasks.forEach(task => {
      total++;
      if (task.status === 'completed') {
        completed++;
      }
      
      if (task.subtasks && task.subtasks.length > 0) {
        const subCounts = countTasksRecursively(task.subtasks);
        total += subCounts.total;
        completed += subCounts.completed;
      }
    });

    return { total, completed };
  };

  const getTotalTasks = () => {
    return sections.reduce((total, section) => {
      const sectionCounts = countTasksRecursively(section.tasks);
      return total + sectionCounts.total;
    }, 0);
  };

  const getCompletedTasks = () => {
    return sections.reduce((total, section) => {
      const sectionCounts = countTasksRecursively(section.tasks);
      return total + sectionCounts.completed;
    }, 0);
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
        {sections.map((section) => (
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
                {section.tasks.map((task) => renderTask(task, 0, section.id))}
                
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