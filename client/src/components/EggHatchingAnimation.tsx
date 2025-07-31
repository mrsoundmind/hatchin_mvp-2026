import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EggHatchingAnimationProps {
  onComplete: () => void;
  projectName: string;
}

export function EggHatchingAnimation({ onComplete, projectName }: EggHatchingAnimationProps) {
  const [stage, setStage] = useState<'floating' | 'cracking' | 'hatched' | 'maya-appears'>('floating');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('cracking'), 1500);
    const timer2 = setTimeout(() => setStage('hatched'), 3000);
    const timer3 = setTimeout(() => setStage('maya-appears'), 4000);
    const timer4 = setTimeout(() => onComplete(), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Floating Egg */}
        <AnimatePresence mode="wait">
          {stage === 'floating' && (
            <motion.div
              key="floating"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ 
                scale: 1, 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              exit={{ scale: 1.1, opacity: 0.8 }}
              transition={{ 
                duration: 1.5,
                y: { repeat: Infinity, duration: 2 },
                rotate: { repeat: Infinity, duration: 4 }
              }}
              className="mb-8"
            >
              <div className="w-32 h-40 bg-gradient-to-b from-purple-200 via-purple-100 to-white rounded-full relative shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-b from-purple-100/50 to-white/80 rounded-full"></div>
                <div className="absolute top-4 left-8 w-6 h-4 bg-white/60 rounded-full blur-sm"></div>
              </div>
            </motion.div>
          )}

          {/* Cracking Egg */}
          {stage === 'cracking' && (
            <motion.div
              key="cracking"
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.05, 1, 1.05, 1],
                rotate: [0, -2, 2, -1, 0]
              }}
              transition={{ duration: 1.5, repeat: 2 }}
              className="mb-8"
            >
              <div className="w-32 h-40 bg-gradient-to-b from-purple-200 via-purple-100 to-white rounded-full relative shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-b from-purple-100/50 to-white/80 rounded-full"></div>
                
                {/* Crack lines */}
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute top-16 left-12 w-0.5 h-8 bg-gray-600 rotate-12"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="absolute top-20 left-8 w-6 h-0.5 bg-gray-600"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                  className="absolute top-24 left-20 w-0.5 h-6 bg-gray-600 -rotate-12"
                ></motion.div>
              </div>
            </motion.div>
          )}

          {/* Hatched Egg */}
          {stage === 'hatched' && (
            <motion.div
              key="hatched"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="mb-8"
            >
              <div className="relative">
                {/* Top half */}
                <motion.div
                  initial={{ y: 0, rotate: 0 }}
                  animate={{ y: -20, rotate: -15, x: -10 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-32 h-20 bg-gradient-to-b from-purple-200 to-purple-100 rounded-t-full relative shadow-xl"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}
                >
                  <div className="absolute inset-1 bg-gradient-to-b from-purple-100/50 to-white/30 rounded-t-full"></div>
                </motion.div>
                
                {/* Bottom half */}
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: 5 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-32 h-20 bg-gradient-to-b from-white via-purple-50 to-purple-100 rounded-b-full relative shadow-inner"
                  style={{ clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)' }}
                >
                  <div className="absolute inset-1 bg-gradient-to-b from-white/80 to-purple-50/50 rounded-b-full"></div>
                </motion.div>

                {/* Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0], 
                      opacity: [0, 1, 0],
                      x: [0, (i % 2 ? 20 : -20) * (i + 1)],
                      y: [0, -10 * (i + 1)]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.5 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute top-8 left-16 w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      left: `${50 + (i % 3 - 1) * 20}%`,
                      top: `${40 + (i % 2) * 20}%`
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Maya Appears */}
          {stage === 'maya-appears' && (
            <motion.div
              key="maya"
              initial={{ scale: 0, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-3xl">🤖</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-4"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">Maya is Ready!</h3>
                <p className="text-purple-200">Your AI idea partner has hatched and is ready to help develop your project.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-xl text-purple-300 mb-2">Initializing</h2>
          <h1 className="text-3xl font-bold text-white">{projectName}</h1>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="mt-8"
        >
          <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-purple-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}