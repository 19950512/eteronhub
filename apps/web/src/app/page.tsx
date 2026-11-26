import {
  ArrowRight,
  BadgeCheck,
  Building2,
  HardHat,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { marketImages, type MarketImage } from "../assets/images";
import { JobResults } from "../components/jobs/job-results";

const SPECIALTIES: { title: string; description: string; image: MarketImage }[] = [
  {
    title: "Soldagem",
    description: "MIG/MAG, TIG e eletrodo revestido em fábrica, oficina e campo.",
    image: marketImages.weldingFrame,
  },
  {
    title: "Caldeiraria",
    description: "Traçagem, corte, esmerilhamento e montagem de tubulações e chapas.",
    image: marketImages.grindingSparks,
  },
  {
    title: "Estruturas metálicas",
    description: "Fabricação e montagem de galpões, pontes, mezaninos e coberturas.",
    image: marketImages.steelFraming,
  },
  {
    title: "Montagem industrial",
    description: "Montadores, encarregados, projetistas e técnicos de segurança.",
    image: marketImages.steelAssembly,
  },
];

export default function HomePage(): JSX.Element {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-media">
          <Image
            src={marketImages.welderSparks.src}
            alt=""
            priority
            fill
            sizes="100vw"
            placeholder="blur"
          />
        </div>
        <div className="container">
          <div className="hero-content">
            <span className="eyebrow">
              <Zap aria-hidden="true" size={14} />
              Marketplace da metalurgia
            </span>
            <h1 id="hero-title" className="hero-title">
              Trabalho certo para quem <em>constrói com aço</em>.
            </h1>
            <p className="hero-lead">
              Vagas de soldagem, caldeiraria, montagem e estruturas metálicas em um só
              lugar. Encontre a oportunidade e fale direto com a empresa.
            </p>

            <form className="hero-search" action="/vagas" role="search">
              <div className="input-group">
                <MapPin aria-hidden="true" />
                <label htmlFor="hero-local" className="sr-only">
                  Onde você quer trabalhar?
                </label>
                <input
                  id="hero-local"
                  name="local"
                  className="input"
                  type="search"
                  autoComplete="address-level2"
                  placeholder="Onde você quer trabalhar?"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg">
                <Search aria-hidden="true" />
                Buscar vagas
              </button>
            </form>

            <ul className="hero-highlights">
              <li>
                <BadgeCheck aria-hidden="true" />
                Vagas revisadas pela equipe
              </li>
              <li>
                <QrCode aria-hidden="true" />
                Créditos via Pix
              </li>
              <li>
                <ShieldCheck aria-hidden="true" />
                Contato direto com a empresa
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="vagas-recentes">
        <div className="container">
          <div className="section-header-row">
            <div className="section-header">
              <span className="eyebrow">Oportunidades</span>
              <h2 id="vagas-recentes">Vagas recentes</h2>
              <p className="text-muted">
                Toda vaga passa por moderação antes de ir ao ar. A empresa fica oculta até
                você desbloquear.
              </p>
            </div>
            <Link href="/vagas" className="btn btn-secondary">
              Ver todas as vagas
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <JobResults limit={6} />
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="especialidades">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Especialidades</span>
            <h2 id="especialidades">
              Feito para o chão de fábrica e o canteiro de obras
            </h2>
            <p className="text-muted">
              Do soldador ao projetista: profissionais que fazem a indústria metalúrgica
              acontecer.
            </p>
          </div>
          <div className="grid-4">
            {SPECIALTIES.map((specialty) => (
              <article key={specialty.title} className="specialty-card">
                <Image
                  src={specialty.image.src}
                  alt={specialty.image.alt}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  placeholder="blur"
                />
                <h3>{specialty.title}</h3>
                <p>{specialty.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Como funciona</span>
            <h2 id="como-funciona">
              Simples para quem procura, seguro para quem contrata
            </h2>
          </div>
          <div className="grid-2">
            <article className="card audience-card">
              <div className="audience-card-head">
                <span className="icon-tile icon-tile-lg">
                  <HardHat aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow">Para trabalhadores</p>
                  <h3>Ache a vaga e fale com quem contrata</h3>
                </div>
              </div>
              <ol className="steps">
                <li className="step">
                  <div>
                    <h4>Busque vagas por região</h4>
                    <p className="text-muted">
                      Salário, requisitos e local à vista, sem precisar de cadastro.
                    </p>
                  </div>
                </li>
                <li className="step">
                  <div>
                    <h4>Compre créditos via Pix</h4>
                    <p className="text-muted">
                      Pague pelo app do seu banco; os créditos entram assim que o Pix é
                      confirmado.
                    </p>
                  </div>
                </li>
                <li className="step">
                  <div>
                    <h4>Desbloqueie o contato</h4>
                    <p className="text-muted">
                      Veja nome, telefone e e-mail da empresa e fale direto com ela.
                    </p>
                  </div>
                </li>
              </ol>
              <Link href="/cadastro/trabalhador" className="btn btn-primary">
                Criar conta de trabalhador
              </Link>
            </article>

            <article className="card audience-card">
              <div className="audience-card-head">
                <span className="icon-tile icon-tile-lg">
                  <Building2 aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow">Para empresas</p>
                  <h3>Receba contato de quem tem interesse real</h3>
                </div>
              </div>
              <ol className="steps">
                <li className="step">
                  <div>
                    <h4>Cadastre sua empresa</h4>
                    <p className="text-muted">
                      CNPJ, razão social e e-mail — leva poucos minutos.
                    </p>
                  </div>
                </li>
                <li className="step">
                  <div>
                    <h4>Publique a vaga</h4>
                    <p className="text-muted">
                      Nossa equipe revisa e publica de forma anônima.
                    </p>
                  </div>
                </li>
                <li className="step">
                  <div>
                    <h4>Receba contatos qualificados</h4>
                    <p className="text-muted">
                      Seus dados só aparecem para quem desbloqueia a vaga.
                    </p>
                  </div>
                </li>
              </ol>
              <Link href="/cadastro/empresa" className="btn btn-secondary">
                Cadastrar minha empresa
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section"
        style={{ paddingTop: 0 }}
        aria-labelledby="cta-empresas"
      >
        <div className="container">
          <div className="cta-band">
            <Image
              src={marketImages.steelFraming.src}
              alt=""
              sizes="100vw"
              placeholder="blur"
            />
            <div className="stack">
              <span className="eyebrow" style={{ color: "var(--spark-300)" }}>
                Contratando?
              </span>
              <h2 id="cta-empresas">Sua próxima equipe de montagem está aqui.</h2>
              <p>
                Publique vagas para soldadores, caldeireiros, montadores e serralheiros e
                receba contato de profissionais da sua região.
              </p>
            </div>
            <div className="cluster">
              <Link href="/cadastro/empresa" className="btn btn-primary btn-lg">
                Publicar vaga
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/login" className="btn btn-on-dark btn-lg">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
