"use client";
import { motion, useReducedMotion } from "motion/react";
/* CONTENT STORYBOARD
 * shell / heading / actions        0ms (always available)
 * secondary panel lifts           80ms
 * next panel                     160ms
 * chart / detail                 240ms
 */
const TIMING = { step: 0.08 };
export function Reveal({
  children,
  className = "",
  order = 0,
}: {
  children: React.ReactNode;
  className?: string;
  order?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 280,
              damping: 28,
              delay: order * TIMING.step,
            }
      }
    >
      {children}
    </motion.div>
  );
}
