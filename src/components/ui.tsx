import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-white border border-navy shadow-[0_1px_2px_rgba(13,35,64,0.28)] hover:bg-navy-deep hover:border-navy-deep disabled:hover:bg-navy active:translate-y-px",
  secondary:
    "bg-card text-ink border border-line-strong hover:border-navy/40 hover:bg-white hover:text-navy-deep active:translate-y-px",
  ghost:
    "bg-transparent text-ink-soft border border-transparent hover:bg-paper-deep hover:text-ink",
  danger:
    "bg-transparent text-clay border border-clay/30 hover:bg-clay-soft hover:border-clay/60",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

const fieldBase =
  "w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15 disabled:opacity-60";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-24", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "pr-8", className)} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-clay">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card p-6 shadow-[0_1px_0_rgba(23,21,15,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type BadgeTone = "neutral" | "navy" | "clay" | "sand";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-sand text-ink-soft",
  navy: "bg-navy-soft text-navy-deep",
  clay: "bg-clay-soft text-clay",
  sand: "bg-paper-deep text-ink-soft",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
        badgeTones[tone],
      )}
    >
      {dot ? (
        <span
          className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}

export function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-navy" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-card/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const tones = {
    error: "border-clay/30 bg-clay-soft text-clay",
    success: "border-navy/30 bg-navy-soft text-navy-deep",
    info: "border-line-strong bg-paper-deep text-ink-soft",
  } as const;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-xl border px-3.5 py-2.5 text-sm", tones[tone])}
    >
      {children}
    </p>
  );
}
