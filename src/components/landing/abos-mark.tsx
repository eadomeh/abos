import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  glow?: boolean;
};

/** Official ABOS mark — hexagonal crystal from the operating-layer identity. */
export function AbosMark({ className, title = "ABOS", glow = false }: Props) {
  return (
    <img
      src="/abos-mark.svg"
      alt={title}
      width={32}
      height={32}
      className={cn("shrink-0", glow && "drop-shadow-[0_0_18px_rgba(110,231,183,0.45)]", className)}
    />
  );
}
