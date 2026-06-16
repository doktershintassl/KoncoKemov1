import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", children, ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-6 py-3 text-base";
    
    let variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600 shadow-lg shadow-primary-500/20",
      secondary: "bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-500",
      outline: "border-2 border-gray-200 bg-transparent hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 text-gray-900 focus:ring-primary-500",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
