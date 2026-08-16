import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-cream group-[.toaster]:text-ink group-[.toaster]:border-[3px] group-[.toaster]:border-ink group-[.toaster]:rounded-none group-[.toaster]:shadow-[4px_4px_0_0_var(--color-ink)] group-[.toaster]:font-sans group-[.toaster]:uppercase",
          title: "group-[.toast]:font-display group-[.toast]:text-sm group-[.toast]:uppercase group-[.toast]:leading-tight",
          description: "group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:text-slate",
          actionButton:
            "group-[.toast]:rounded-none group-[.toast]:border-[3px] group-[.toast]:border-ink group-[.toaster]:bg-ink group-[.toaster]:text-cream group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:shadow-[2px_2px_0_0_var(--color-ink)] group-[.toast]:transition-all group-[.toast]:hover:translate-x-0.5 group-[.toast]:hover:translate-y-0.5 group-[.toast]:hover:shadow-none group-[.toast]:active:translate-x-1 group-[.toast]:active:translate-y-1",
          cancelButton:
            "group-[.toast]:rounded-none group-[.toast]:border-[3px] group-[.toast]:border-ink group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:shadow-[2px_2px_0_0_var(--color-ink)] group-[.toast]:transition-all group-[.toast]:hover:translate-x-0.5 group-[.toast]:hover:translate-y-0.5 group-[.toast]:hover:shadow-none group-[.toast]:active:translate-x-1 group-[.toast]:active:translate-y-1",
          closeButton:
            "group-[.toast]:rounded-none group-[.toast]:border-ink group-[.toast]:text-ink group-[.toast]:hover:bg-ink group-[.toast]:hover:text-cream",
          success: "group-[.toast]:[--normal-bg:var(--color-teal)] group-[.toast]:[--normal-text:var(--color-cream)] group-[.toast]:[--normal-border:var(--color-ink)]",
          error: "group-[.toast]:[--normal-bg:var(--color-red)] group-[.toast]:[--normal-text:var(--color-cream)] group-[.toast]:[--normal-border:var(--color-ink)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
