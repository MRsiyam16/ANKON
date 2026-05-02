---
name: animating-with-framer-motion
description: Expert in implementing fluid, physics-based animations and complex layout transitions using Framer Motion in React applications. Specializes in orchestration, layout animations, and gesture-driven UI.
---

# Framer Motion Animation Expert

## When to use this skill
- When building high-end React components that require fluid motion.
- When implementing page transitions or layout changes (`layout` prop).
- When adding gesture-based interactions (drag, hover, tap).
- When orchestrating complex sequences of animations across multiple components.

## Workflow
1.  **Motion Foundation**: Identify which components need to be converted to `motion` components (e.g., `motion.div`).
2.  **State Management**: Define the `variants` for clear, declarative animation states.
3.  **Orchestration**: Use `AnimatePresence` for exit animations and `Transition` objects for timing/easing.
4.  **Optimization**: Ensure `will-change` or `transform: translateZ(0)` is applied where necessary for performance.

## Instructions
- **Declarative Variants**: Always prefer using `variants` over inline `animate` props for complex UI to keep the code clean and reusable.
- **Layout Animations**: Use the `layout` prop to automatically animate changes in size or position without complex CSS calculations.
- **Gesture Control**: Implement `whileHover`, `whileTap`, and `drag` for tactile feedback.
- **Shared Layouts**: Use `layoutId` to animate elements between different components (e.g., a shared selection indicator).

### Recommended Transition Patterns
```javascript
const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};

const menuVariants = {
  open: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
  closed: { opacity: 0, x: "-100%" }
};
```

## Resources
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Layout Animations Guide](https://www.framer.com/motion/layout-animations/)
