/**
 * Slider Component
 * A custom range slider built with HTML5 input[type="range"]
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const currentValue = value[0] || 0;
    const percentage = ((currentValue - (min as number)) / ((max as number) - (min as number))) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.([newValue]);
    };

    return (
      <div className="relative w-full group">
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 rounded-full pointer-events-none shadow-inner" />
        
        {/* Filled track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-full pointer-events-none transition-all duration-150 shadow-md shadow-blue-500/30 dark:shadow-blue-600/50"
          style={{ width: `${percentage}%` }}
        />

        {/* Input slider */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className={cn(
            "relative w-full h-3 rounded-full appearance-none cursor-pointer bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-6",
            "[&::-webkit-slider-thumb]:w-6",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-gradient-to-br",
            "[&::-webkit-slider-thumb]:from-blue-400",
            "[&::-webkit-slider-thumb]:to-cyan-500",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:transition-all",
            "[&::-webkit-slider-thumb]:duration-150",
            "[&::-webkit-slider-thumb]:hover:scale-125",
            "[&::-webkit-slider-thumb]:active:scale-110",
            "[&::-webkit-slider-thumb]:shadow-xl",
            "[&::-webkit-slider-thumb]:shadow-blue-400/50",
            "[&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:dark:border-slate-800",
            "[&::-moz-range-thumb]:h-6",
            "[&::-moz-range-thumb]:w-6",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-gradient-to-br",
            "[&::-moz-range-thumb]:from-blue-400",
            "[&::-moz-range-thumb]:to-cyan-500",
            "[&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-white",
            "[&::-moz-range-thumb]:dark:border-slate-800",
            "[&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:transition-all",
            "[&::-moz-range-thumb]:duration-150",
            "[&::-moz-range-thumb]:hover:scale-125",
            "[&::-moz-range-thumb]:active:scale-110",
            "[&::-moz-range-thumb]:shadow-xl",
            "[&::-moz-range-thumb]:shadow-blue-400/50",
            "[&::-webkit-slider-runnable-track]:rounded-full",
            "[&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-moz-range-track]:bg-transparent",
            "[&::-moz-range-track]:border-0",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-blue-500/50",
            "focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
