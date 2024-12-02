import { cn } from "../../lib/utils";
import React from "react";

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: string; // spacing between elements, e.g., '1rem', '16px', etc.
  align?: "start" | "center" | "end" | "stretch"; // flex alignment options
}

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: string; // spacing between elements, e.g., '1rem', '16px', etc.
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"; // justify-content options
  align?: "start" | "center" | "end" | "stretch"; // align-items options
}

export const VStack: React.FC<VStackProps> = ({
  children,
  spacing = "1rem",
  align = "start",
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        `flex flex-col space-y-${spacing} items-${align}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const HStack: React.FC<HStackProps> = ({
  children,
  spacing = "1rem",
  justify = "start",
  align = "center",
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex", className)}
      style={{
        gap: spacing,
        justifyContent:
          justify === "between" || justify === "around" || justify === "evenly"
            ? `space-${justify}`
            : justify,
        alignItems: align,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
