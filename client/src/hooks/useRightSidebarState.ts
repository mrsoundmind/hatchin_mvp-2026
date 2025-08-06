import { useState, useEffect, useCallback } from 'react';
import type { 
  RightSidebarState, 
  RightSidebarUserPreferences, 
  RightSidebarExpandedSections,
  Project,
  Team,
  Agent
} from '@shared/schema';

const STORAGE_KEY = 'hatchin_right_sidebar_preferences';

const defaultPreferences: RightSidebarUserPreferences = {
  expandedSections: {
    coreDirection: true,
    targetAudience: false,
    executionRules: false,
    brandCulture: false,
    performance: true,
    skills: true,
    activity: false,
  },
  defaultView: 'project',
  autoSave: true,
  autoSaveDelay: 2000, // 2 seconds
  showTimestamps: true,
  compactMode: false,
};

const defaultState: RightSidebarState = {
  coreDirection: {
    whatBuilding: '',
    whyMatters: '',
    whoFor: '',
  },
  executionRules: '',
  teamCulture: '',
  expandedSections: defaultPreferences.expandedSections,
  recentlySaved: new Set(),
  activeView: 'none',
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
  lastSaved: {},
};

export function useRightSidebarState(
  activeProject?: Project,
  activeTeam?: Team,
  activeAgent?: Agent
) {
  const [state, setState] = useState<RightSidebarState>(defaultState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored) as RightSidebarUserPreferences;
        setState(prev => ({
          ...prev,
          preferences: { ...defaultPreferences, ...preferences },
          expandedSections: { ...defaultPreferences.expandedSections, ...preferences.expandedSections },
        }));
      }
    } catch (error) {
      console.warn('Failed to load right sidebar preferences from localStorage:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  const savePreferences = useCallback((preferences: RightSidebarUserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save right sidebar preferences to localStorage:', error);
    }
  }, []);

  // Update active view based on selections
  useEffect(() => {
    let newView: RightSidebarState['activeView'] = 'none';
    if (activeAgent) {
      newView = 'agent';
    } else if (activeTeam) {
      newView = 'team';
    } else if (activeProject) {
      newView = 'project';
    }

    setState(prev => ({ ...prev, activeView: newView }));
  }, [activeProject, activeTeam, activeAgent]);

  // Update project data when activeProject changes
  useEffect(() => {
    if (activeProject) {
      setState(prev => ({
        ...prev,
        coreDirection: {
          whatBuilding: activeProject.coreDirection?.whatBuilding || '',
          whyMatters: activeProject.coreDirection?.whyMatters || '',
          whoFor: activeProject.coreDirection?.whoFor || '',
        },
        executionRules: activeProject.executionRules || '',
        teamCulture: activeProject.teamCulture || '',
      }));
    }
  }, [activeProject]);

  // Actions
  const updateCoreDirection = useCallback((field: keyof RightSidebarState['coreDirection'], value: string) => {
    setState(prev => ({
      ...prev,
      coreDirection: {
        ...prev.coreDirection,
        [field]: value,
      },
    }));
  }, []);

  const updateExecutionRules = useCallback((value: string) => {
    setState(prev => ({ ...prev, executionRules: value }));
  }, []);

  const updateTeamCulture = useCallback((value: string) => {
    setState(prev => ({ ...prev, teamCulture: value }));
  }, []);

  const toggleSection = useCallback((section: keyof RightSidebarExpandedSections) => {
    setState(prev => {
      const newExpandedSections = {
        ...prev.expandedSections,
        [section]: !prev.expandedSections[section],
      };
      
      const newPreferences = {
        ...prev.preferences,
        expandedSections: newExpandedSections,
      };

      // Save to localStorage
      savePreferences(newPreferences);

      return {
        ...prev,
        expandedSections: newExpandedSections,
        preferences: newPreferences,
      };
    });
  }, [savePreferences]);

  const setRecentlySaved = useCallback((section: string) => {
    setState(prev => ({
      ...prev,
      recentlySaved: new Set(Array.from(prev.recentlySaved).concat(section)),
      lastSaved: {
        ...prev.lastSaved,
        [section]: new Date(),
      },
    }));

    // Clear the "recently saved" indicator after 3 seconds
    setTimeout(() => {
      setState(prev => {
        const newSet = new Set(prev.recentlySaved);
        newSet.delete(section);
        return {
          ...prev,
          recentlySaved: newSet,
        };
      });
    }, 3000);
  }, []);

  const clearRecentlySaved = useCallback((section: string) => {
    setState(prev => {
      const newSet = new Set(prev.recentlySaved);
      newSet.delete(section);
      return {
        ...prev,
        recentlySaved: newSet,
      };
    });
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<RightSidebarUserPreferences>) => {
    setState(prev => {
      const updatedPreferences = { ...prev.preferences, ...newPreferences };
      savePreferences(updatedPreferences);
      
      return {
        ...prev,
        preferences: updatedPreferences,
        // Update expanded sections if they were changed
        ...(newPreferences.expandedSections && {
          expandedSections: { ...prev.expandedSections, ...newPreferences.expandedSections }
        }),
      };
    });
  }, [savePreferences]);

  const resetPreferences = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferences: defaultPreferences,
      expandedSections: defaultPreferences.expandedSections,
    }));
    savePreferences(defaultPreferences);
  }, [savePreferences]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    state,
    actions: {
      updateCoreDirection,
      updateExecutionRules,
      updateTeamCulture,
      toggleSection,
      setRecentlySaved,
      clearRecentlySaved,
      updatePreferences,
      resetPreferences,
      setLoading,
      setError,
    },
  };
}