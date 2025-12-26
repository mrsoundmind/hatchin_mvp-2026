import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeModal } from "./WelcomeModal";
import { OnboardingSteps } from "./OnboardingSteps";
import { PathSelectionModal } from "./PathSelectionModal";
import StarterPacksModal from "./StarterPacksModal";

interface OnboardingManagerProps {
  onComplete: (path: 'idea' | 'template' | 'scratch', templateData?: any) => void;
}

type OnboardingStep = 'welcome' | 'steps' | 'path-selection' | 'starter-packs' | 'completed';

export function OnboardingManager({ onComplete }: OnboardingManagerProps) {
  const { isSignedIn, hasCompletedOnboarding, completeOnboarding, signIn } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Check if user has completed onboarding or is already signed in
  useEffect(() => {
    if (isSignedIn || hasCompletedOnboarding()) {
      setCurrentStep('completed');
    }
  }, [isSignedIn, hasCompletedOnboarding]);

  const handleGetStarted = () => {
    setCurrentStep('steps');
  };

  const handleStepsComplete = () => {
    setCurrentStep('path-selection');
  };

  const handleStartWithIdea = () => {
    // Auto-sign in user
    signIn({ id: 'user-1', name: 'Shashank' });
    completeOnboarding();
    onComplete('idea');
    setCurrentStep('completed');
  };

  const handleUseStarterPack = () => {
    setCurrentStep('starter-packs');
  };

  const handleFigureItOut = () => {
    // Auto-sign in user
    signIn({ id: 'user-1', name: 'Shashank' });
    completeOnboarding();
    onComplete('scratch');
    setCurrentStep('completed');
  };

  const handleStarterPackSelect = (pack: any) => {
    setSelectedTemplate(pack);
    // Auto-sign in user
    signIn({ id: 'user-1', name: 'Shashank' });
    completeOnboarding();
    onComplete('template', pack);
    setCurrentStep('completed');
  };

  const handleClose = () => {
    setCurrentStep('completed');
  };

  // Don't render anything if onboarding is completed
  if (currentStep === 'completed') {
    return null;
  }

  return (
    <>
      <WelcomeModal
        isOpen={currentStep === 'welcome'}
        onClose={handleClose}
        onGetStarted={handleGetStarted}
      />
      
      <OnboardingSteps
        isOpen={currentStep === 'steps'}
        onClose={handleClose}
        onComplete={handleStepsComplete}
      />
      
      <PathSelectionModal
        isOpen={currentStep === 'path-selection'}
        onClose={handleClose}
        onStartWithIdea={handleStartWithIdea}
        onUseStarterPack={handleUseStarterPack}
        onFigureItOut={handleFigureItOut}
      />
      
      <StarterPacksModal
        isOpen={currentStep === 'starter-packs'}
        onClose={handleClose}
        onSelectTemplate={handleStarterPackSelect}
      />
    </>
  );
}