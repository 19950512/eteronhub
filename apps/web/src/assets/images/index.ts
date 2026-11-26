import type { StaticImageData } from "next/image";
import grindingSparks from "./grinding-sparks.jpg";
import steelAssembly from "./steel-assembly.jpg";
import steelFraming from "./steel-framing.jpg";
import welderSparks from "./welder-sparks.jpg";
import weldingFrame from "./welding-frame.jpg";

export interface MarketImage {
  src: StaticImageData;
  alt: string;
  credit: {
    author: string;
    license: "Domínio público" | "CC BY 2.0";
    licenseUrl?: string;
    sourceUrl: string;
  };
}

const CC_BY_2 = "https://creativecommons.org/licenses/by/2.0/deed.pt-br";

// invariant: toda imagem exibida no site vem deste módulo, para que a página
// /creditos-de-imagens liste autoria e licença de todas (exigência da CC BY).
export const marketImages = {
  welderSparks: {
    src: welderSparks,
    alt: "Soldador com máscara de proteção trabalhando em uma peça metálica, com faíscas no ar",
    credit: {
      author: "Airman 1st Class David Owsianka (U.S. Air Force)",
      license: "Domínio público",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Sparks_fly_at_metal_tech_150623-F-CB366-073.jpg",
    },
  },
  weldingFrame: {
    src: weldingFrame,
    alt: "Soldador agachado unindo perfis metálicos de uma estrutura em uma oficina",
    credit: {
      author: "U.S. Air Force",
      license: "Domínio público",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Let_the_sparks_fly_(13313009905).jpg",
    },
  },
  grindingSparks: {
    src: grindingSparks,
    alt: "Profissional com equipamento de proteção usando esmerilhadeira em tubulação metálica",
    credit: {
      author: "PEO ACWA",
      license: "CC BY 2.0",
      licenseUrl: CC_BY_2,
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Blue_Grass_Chemical_Agent-Destruction_Pilot_Plant_Welders_(33835411935).jpg",
    },
  },
  steelFraming: {
    src: steelFraming,
    alt: "Vigas de aço de uma estrutura metálica montadas em sequência, com pórtico rolante ao fundo",
    credit: {
      author: "MassDOT",
      license: "Domínio público",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:New_Structural_Steel_Framing-_Span_10_(15775857463).jpg",
    },
  },
  steelAssembly: {
    src: steelAssembly,
    alt: "Montagem de vigas e pilares de aço no interior de uma obra",
    credit: {
      author: "MTA Capital Construction Mega Projects",
      license: "CC BY 2.0",
      licenseUrl: CC_BY_2,
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Structural_steel_beam_and_joist_installation_in_the_future_LIRR_Concourse._(CH014B,_9-11-2017)_(37071902632).jpg",
    },
  },
} satisfies Record<string, MarketImage>;
