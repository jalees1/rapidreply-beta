import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  light?: boolean;
  priority?: boolean;
}

/** The shared Rapid Reply mark and wordmark used across the application. */
export default function BrandLogo({
  className,
  compact = false,
  light = false,
  priority = false,
}: BrandLogoProps) {
  if (compact) {
    return (
      <Image
        src="/brand/rapid-reply-mark.png"
        alt="Rapid Reply"
        width={128}
        height={128}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={light ? "/brand/rapid-reply-logo-white.png" : "/brand/rapid-reply-logo.png"}
      alt="Rapid Reply"
      width={1000}
      height={258}
      className={className}
      priority={priority}
    />
  );
}
