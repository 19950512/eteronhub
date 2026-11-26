import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { marketImages } from "../assets/images";
import { JobResults } from "../components/jobs/job-results";

const TRADES: { name: string; detail: string }[] = [
  {
    name: "Soldagem",
    detail: "MIG/MAG, TIG e eletrodo revestido, em fábrica, oficina e campo.",
  },
  {
    name: "Caldeiraria",
    detail: "Traçagem, corte, esmerilhamento e montagem de tubulação e chapa.",
  },
  {
    name: "Estruturas metálicas",
    detail: "Fabricação e montagem de galpão, ponte, mezanino e cobertura.",
  },
  {
    name: "Montagem industrial",
    detail: "Montador, encarregado, projetista e técnico de segurança.",
  },
];

export default function HomePage(): JSX.Element {
  return (
    <>
      <section className="intro" aria-labelledby="intro-title">
        <div className="container intro-grid">
          <div className="intro-text">
            <h1 id="intro-title" className="intro-title">
              Vagas de solda, caldeiraria e montagem.
            </h1>
            <p className="intro-lead">
              As empresas publicam, a nossa equipe confere e a vaga vai ao ar sem o nome
              de quem está contratando. Se interessar, você desbloqueia o contato com
              créditos comprados no Pix e fala direto com a empresa.
            </p>

            <form className="search-bar" action="/vagas" role="search">
              <label htmlFor="intro-local" className="search-bar-label">
                Cidade ou região
              </label>
              <div className="search-bar-row">
                <input
                  id="intro-local"
                  name="local"
                  type="search"
                  autoComplete="address-level2"
                  placeholder="Ex.: Betim, Grande BH, interior de SP"
                />
                <button type="submit" className="btn btn-lg">
                  <Search aria-hidden="true" />
                  Buscar
                </button>
              </div>
            </form>

            <p className="intro-note">
              Contrata? <Link href="/cadastro/empresa">Publique uma vaga</Link> — não
              custa nada para a empresa.
            </p>
          </div>

          <figure className="intro-figure">
            <Image
              src={marketImages.welderSparks.src}
              alt={marketImages.welderSparks.alt}
              priority
              sizes="(min-width: 960px) 42vw, 100vw"
              placeholder="blur"
            />
            <figcaption>
              Foto: {marketImages.welderSparks.credit.author.split(" (")[0]}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="block" aria-labelledby="vagas-abertas">
        <div className="container">
          <div className="block-head">
            <h2 id="vagas-abertas">Abertas agora</h2>
            <Link href="/vagas" className="text-link">
              Todas as vagas
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <JobResults limit={6} />
        </div>
      </section>

      <section className="block block-trades" aria-labelledby="funcoes">
        <div className="container trades">
          <div className="trades-photo">
            <Image
              src={marketImages.grindingSparks.src}
              alt={marketImages.grindingSparks.alt}
              sizes="(min-width: 960px) 38vw, 100vw"
              placeholder="blur"
            />
          </div>
          <div>
            <h2 id="funcoes">O que aparece por aqui</h2>
            <dl className="trade-list">
              {TRADES.map((trade) => (
                <div key={trade.name}>
                  <dt>{trade.name}</dt>
                  <dd>{trade.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="block" aria-labelledby="como-funciona">
        <div className="container">
          <h2 id="como-funciona" className="block-title">
            Como funciona
          </h2>
          <div className="how">
            <div className="how-col">
              <h3>Para quem procura trabalho</h3>
              <ol className="steps">
                <li>
                  <h4>Procure por cidade ou região</h4>
                  <p>Salário, requisitos e local ficam visíveis sem precisar de conta.</p>
                </li>
                <li>
                  <h4>Compre créditos no Pix</h4>
                  <p>
                    Eles entram na sua carteira assim que o banco confirma o pagamento.
                  </p>
                </li>
                <li>
                  <h4>Desbloqueie a vaga que interessa</h4>
                  <p>
                    Aparecem nome, telefone e e-mail da empresa. Se abrir a mesma vaga de
                    novo, não cobra outra vez.
                  </p>
                </li>
              </ol>
              <Link href="/cadastro/trabalhador" className="btn btn-primary">
                Criar conta de trabalhador
              </Link>
            </div>

            <div className="how-col">
              <h3>Para quem contrata</h3>
              <ol className="steps">
                <li>
                  <h4>Cadastre a empresa</h4>
                  <p>CNPJ, razão social e um e-mail de acesso.</p>
                </li>
                <li>
                  <h4>Escreva a vaga</h4>
                  <p>A moderação confere e publica sem mostrar o nome da empresa.</p>
                </li>
                <li>
                  <h4>Atenda quem desbloqueou</h4>
                  <p>
                    Seu contato só chega a quem pagou para ver a vaga, o que já filtra
                    bastante curioso.
                  </p>
                </li>
              </ol>
              <Link href="/cadastro/empresa" className="btn btn-secondary">
                Cadastrar empresa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="closing" aria-labelledby="chamada-empresas">
        <div className="container closing-inner">
          <h2 id="chamada-empresas">Precisa de gente na obra?</h2>
          <p>
            Soldador, caldeireiro, montador, serralheiro. Publique a vaga e receba o
            contato de quem é da região.
          </p>
          <div className="cluster">
            <Link href="/cadastro/empresa" className="btn btn-primary btn-lg">
              Publicar vaga
            </Link>
            <Link href="/login" className="btn btn-on-dark btn-lg">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
