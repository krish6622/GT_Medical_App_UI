import logoUrl from "../assets/images/logo.png";

/** GT Medical Solutions logo (real asset from src/assets/images/logo.png). */
export function GtLogo({ width = 150, className = "" }: { width?: number; className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="GT Medical Solutions"
      style={{ width, height: "auto" }}
      className={className}
      draggable={false}
    />
  );
}
