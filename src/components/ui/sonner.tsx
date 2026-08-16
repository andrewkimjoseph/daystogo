import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:font-sans group-[.toaster]:uppercase group-[.toaster]:font-bold",
          title: "group-[.toast]:font-display group-[.toast]:text-sm group-[.toast]:uppercase group-[.toast]:leading-tight",
          description: "group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:uppercase",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
