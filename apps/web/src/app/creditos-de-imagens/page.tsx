import type { Metadata } from "next";
import Image from "next/image";
import { marketImages, type MarketImage } from "../../assets/images";
import { PageHeader } from "../../components/ui/page-header";

const IMAGES: MarketImage[] = Object.values(marketImages);

export const metadata: Metadata = {
  title: "Créditos das imagens",
  description: "Autoria e licença das fotografias usadas no Eteron Hub.",
};

export default function ImageCreditsPage(): JSX.Element {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="Institucional"
        title="Créditos das imagens"
        description="As fotografias do site vêm do Wikimedia Commons, em domínio público ou sob licença Creative Commons. O uso não indica apoio dos autores ou das instituições ao Eteron Hub."
      />
      <div className="grid-3">
        {IMAGES.map((image) => (
          <figure
            key={image.credit.sourceUrl}
            className="card stack"
            style={{ margin: 0 }}
          >
            <div className="credits-photo">
              <Image
                src={image.src}
                alt={image.alt}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                placeholder="blur"
              />
            </div>
            <figcaption className="stack-sm text-sm">
              <span>
                <strong>Autor:</strong> {image.credit.author}
              </span>
              <span>
                <strong>Licença:</strong>{" "}
                {image.credit.licenseUrl ? (
                  <a
                    href={image.credit.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {image.credit.license}
                  </a>
                ) : (
                  image.credit.license
                )}
              </span>
              <a href={image.credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                Ver original no Wikimedia Commons
              </a>
              <span className="text-xs text-muted">
                Imagem redimensionada e recortada para o site.
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
