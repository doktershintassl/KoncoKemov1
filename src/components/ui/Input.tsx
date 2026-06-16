import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, rightElement, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 relative">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-gray-400 ${error ? "border-red-500 focus:ring-red-500" : ""} ${rightElement ? "pr-12" : ""} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-sm text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
