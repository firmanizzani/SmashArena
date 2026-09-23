import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_rgba(163,230,53,0.65)] hover:bg-[#b5f04a] hover:shadow-[0_14px_36px_-10px_rgba(163,230,53,0.85)]",
        secondary:
          "border border-white/10 bg-secondary text-secondary-foreground hover:border-white/25 hover:bg-secondary/70",
        outline:
          "border border-white/15 bg-transparent text-foreground hover:border-primary/60 hover:text-primary",
        ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        glass:
          "glass backdrop-blur-[16px] text-foreground hover:border-primary/45 hover:bg-primary/10 hover:text-primary",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-[0.95rem] md:h-14 md:px-10 md:text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
