import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-md bg-onyx px-4 font-sans text-base text-harmattan",
          "shadow-[0_0_0_1px_rgba(246,243,236,0.12)]",
          "placeholder:text-quiet",
          "transition-[box-shadow] duration-150 ease-out",
          "hover:shadow-[0_0_0_1px_rgba(246,243,236,0.2)]",
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-signal)]",
          className,
        )}
        {...props}
      />
    );
  },
);
