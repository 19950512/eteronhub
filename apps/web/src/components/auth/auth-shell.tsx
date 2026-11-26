import Image from "next/image";
import type { ReactNode } from "react";
import type { MarketImage } from "../../assets/images";

interface AuthShellProps {
  image: MarketImage;
  headline: string;
  description: string;
  highlights?: string[];
  children: ReactNode;
}

export function AuthShell({
  image,
  headline,
  description,
  highlights = [],
  children,
}: AuthShellProps): JSX.Element {
  return (
    <div className="auth-shell">
      <div className="auth-media">
        <Image
          src={image.src}
          alt=""
          fill
          priority
          sizes="(min-width: 960px) 50vw, 100vw"
          placeholder="blur"
        />
        <div className="auth-media-text">
          <h2>{headline}</h2>
          <p>{description}</p>
          {highlights.length > 0 && (
            <ul className="auth-points">
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
