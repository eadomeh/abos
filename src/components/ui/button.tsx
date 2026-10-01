import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans font-medium transition-[background-color,box-shadow,scale,color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-signal text-primary-foreground hover:bg-accent focus-visible:outline-none",
        ghost:
          "bg-transparent text-harmattan-muted hover:text-harmattan",
        panel:
          "bg-charcoal text-harmattan shadow-[0_0_0_1px_rgba(246,243,236,0.1)] hover:shadow-[0_0_0_1px_rgba(246,243,236,0.2)]",
      },
      size: {
        md: "h-11 rounded-md px-5 text-sm",
        lg: "h-12 rounded-md px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
