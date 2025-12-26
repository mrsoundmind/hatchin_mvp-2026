import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { AlertCircle, CheckCircle, Clock, User, Tag } from 'lucide-react';

interface ExtractedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedAssignee: string;
  category: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  reasoning: string;
}

interface TaskApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ExtractedTask[];
  onApproveTasks: (approvedTasks: ExtractedTask[]) => void;
  projectName: string;
}

export function TaskApprovalModal({
  isOpen,
  onClose,
  tasks,
  onApproveTasks,
  projectName
}: TaskApprovalModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isApproving, setIsApproving] = useState(false);

  const handleTaskToggle = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map((_, index) => index)));
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const approvedTasks = tasks.filter((_, index) => selectedTasks.has(index));
      await onApproveTasks(approvedTasks);
      setSelectedTasks(new Set());
      onClose();
    } catch (error) {
      console.error('Error approving tasks:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            AI Suggested Tasks for {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header with select all */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedTasks.size === tasks.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedTasks.size} of {tasks.length} tasks selected
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Review and select tasks to create
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <Card key={index} className={`transition-all ${
                selectedTasks.has(index) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTasks.has(index)}
                      onCheckedChange={() => handleTaskToggle(index)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium">
                        {task.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.suggestedAssignee}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {task.category}
                    </Badge>
                    <Badge className={getEffortColor(task.estimatedEffort)}>
                      {task.estimatedEffort} effort
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>AI Reasoning:</strong> {task.reasoning}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedTasks.size > 0 ? (
                `${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''} will be created`
              ) : (
                'Select tasks to create them'
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={selectedTasks.size === 0 || isApproving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isApproving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create {selectedTasks.size} Task{selectedTasks.size > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
