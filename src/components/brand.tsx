import { cn } from "@/components/ui";

export function Brand({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const mark = {
    sm: "h-6 w-6 rounded-[7px] text-xs",
    md: "h-7 w-7 rounded-lg text-sm",
    lg: "h-9 w-9 rounded-xl text-base",
  }[size];

  const word = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center bg-navy font-semibold leading-none text-white",
          mark,
        )}
        aria-hidden
      >
        e
      </span>
      <span className={cn("font-semibold tracking-tight text-ink", word)}>
        encaixe
      </span>
    </span>
  );
}
