import { Dialog, DialogContent } from "@/components/ui/dialog";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export function WelcomeModal({ isOpen, onClose, onGetStarted }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#23262B] border-[#43444B] p-0">
        <div className="text-center space-y-6 p-8">
          {/* Hero illustration - Hatching chicken */}
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <div className="text-6xl">🐣</div>
          </div>
          
          {/* Welcome text */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[#F1F1F3]">
              Welcome to Hatchin
            </h1>
            <p className="text-[#A6A7AB] text-sm leading-relaxed">
              Build AI teammates that understand your goals and help you achieve them.
            </p>
          </div>
          
          {/* Get Started button */}
          <button
            onClick={onGetStarted}
            className="w-full px-6 py-3 bg-[#6c82ff] hover:bg-[#5a6fe8] text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg outline-none focus:outline-none focus:ring-0 border-0"
          >
            Get Started
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
