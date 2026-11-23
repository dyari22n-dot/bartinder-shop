import Image from "next/image";
import { brand } from "@/lib/brand";

type Props = {
  size?: number;
  variant?: "default" | "light";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 44,
  variant = "default",
  className = "",
  priority = false,
}: Props) {
  const src = variant === "light" ? brand.logoLight : brand.logo;

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-transparent ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={brand.name}
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain brand-logo-glow"
      />
    </span>
  );
}