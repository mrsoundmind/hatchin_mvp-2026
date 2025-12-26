import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronRight, Lightbulb, Package } from "lucide-react";

interface PathSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWithIdea: () => void;
  onUseStarterPack: () => void;
  onFigureItOut: () => void;
}

export function PathSelectionModal({ 
  isOpen, 
  onClose, 
  onStartWithIdea, 
  onUseStarterPack, 
  onFigureItOut 
}: PathSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#23262B] border-[#43444B] p-0">
        <div className="p-6">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-2xl font-semibold text-[#F1F1F3]">
              Choose your starting point
            </h2>
            <p className="text-[#A6A7AB]">
              How would you like to begin building your team?
            </p>
          </div>

          {/* Path options */}
          <div className="space-y-4 mb-8">
            {/* Start with an idea */}
            <button
              onClick={onStartWithIdea}
              className="w-full p-6 bg-[#37383B] hover:bg-[#43444B] border border-[#43444B] rounded-lg text-left transition-all duration-200 hover:scale-[1.01] group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F1F1F3] mb-2">
                    Start with an idea
                  </h3>
                  <p className="text-[#A6A7AB] text-sm mb-4">
                    Not sure what to build? Maya will join your chat and help you figure it out.
                  </p>
                  <div className="flex items-center text-[#6C82FF] text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Get started with Maya
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </button>

            {/* Use a starter pack */}
            <button
              onClick={onUseStarterPack}
              className="w-full p-6 bg-[#37383B] hover:bg-[#43444B] border border-[#43444B] rounded-lg text-left transition-all duration-200 hover:scale-[1.01] group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F1F1F3] mb-2">
                    Use a starter pack
                  </h3>
                  <p className="text-[#A6A7AB] text-sm mb-4">
                    Explore curated team templates like:
                  </p>
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#A6A7AB]">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>SaaS Startup (PM, Engineer, Copy)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#A6A7AB]">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Creative Studio (CD, Strategist, Copy)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#A6A7AB]">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>No-Code MVP Builder (Ops, Designer, AI Dev)</span>
                    </div>
                  </div>
                  <div className="flex items-center text-[#6C82FF] text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Browse templates
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Alternative option */}
          <div className="text-center">
            <p className="text-[#A6A7AB] text-sm mb-2">Not sure where to start?</p>
            <button
              onClick={onFigureItOut}
              className="text-[#6C82FF] hover:text-[#5A6FE8] text-sm font-medium underline transition-colors"
            >
              I'll figure it out as I go
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
