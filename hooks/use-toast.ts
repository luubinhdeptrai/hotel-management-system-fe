/**
 * Toast Hook (Simple Implementation)
 * 
 * Basic toast notification hook for user feedback
 */

"use client";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    // Simple alert implementation for now
    // TODO: Implement proper toast UI with shadcn/ui
    const message = [title, description].filter(Boolean).join(": ");
    
    if (variant === "destructive") {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  return { toast };
}
