import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "../../components/legal/legal-page";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_POLICY_VERSION } from "../../lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Quais dados o Eteron Hub coleta, para quê, com quem compartilha, por quanto tempo guarda e como você exerce seus direitos da LGPD.",
};

const mail = <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>;

const DATA_MAP: {
  data: string;
  who: string;
  why: string;
  basis: string;
  keep: string;
}[] = [
  {
    data: "Nome, CPF, e-mail e senha (guardada só como hash)",
    who: "Trabalhador",
    why: "Criar e proteger a conta; identificar quem pagou cada Pix",
    basis: "Execução de contrato (art. 7º, V)",
    keep: "Enquanto a conta existir. O CPF segue guardado depois da exclusão, junto dos pagamentos",
  },
  {
    data: "Telefone, “sobre mim”, segmentos e softwares",
    who: "Trabalhador (opcional)",
    why: "Montar o perfil profissional",
    basis: "Execução de contrato (art. 7º, V)",
    keep: "Até você apagar ou excluir a conta",
  },
  {
    data: "CNPJ, razão social, e-mail e senha (hash)",
    who: "Empresa",
    why: "Criar e proteger a conta; identificar quem publica cada vaga",
    basis: "Execução de contrato (art. 7º, V)",
    keep: "Enquanto a conta existir. CNPJ e razão social seguem guardados depois da exclusão",
  },
  {
    data: "Nome fantasia, setor, cidade/UF, WhatsApp e site",
    who: "Empresa (opcional)",
    why: "Completar o perfil da empresa",
    basis: "Execução de contrato (art. 7º, V)",
    keep: "Até a empresa apagar ou excluir a conta",
  },
  {
    data: "Texto da vaga e contato informado nela (e-mail, telefone, link)",
    who: "Empresa",
    why: "Publicar a vaga e entregar o contato a quem a desbloqueia",
    basis: "Execução de contrato (art. 7º, V)",
    keep: "Enquanto houver obrigação de guarda dos desbloqueios pagos",
  },
  {
    data: "Compras de créditos (valor, data, situação, identificador do Pix) e desbloqueios",
    who: "Trabalhador",
    why: "Liberar créditos, conciliar pagamentos, dar suporte",
    basis: "Execução de contrato e obrigação legal (art. 7º, V e II)",
    keep: "Pelo prazo da legislação fiscal e contábil (em regra, 5 anos)",
  },
  {
    data: "Aceite dos Termos e desta Política: versão, data, IP e navegador",
    who: "Todos",
    why: "Provar quando e como você aceitou",
    basis: "Obrigação legal e exercício de direitos (art. 7º, II e VI; art. 8º, §2º)",
    keep: "Mesmo após a exclusão, pelo prazo em que possa ser exigido",
  },
  {
    data: "Registros técnicos de acesso (IP, data e hora)",
    who: "Todos",
    why: "Segurança, prevenção a fraude e limite de tentativas de login",
    basis: "Obrigação legal (Marco Civil da Internet, art. 15) e legítimo interesse",
    keep: "Pelo prazo exigido pelo Marco Civil",
  },
];

export default function PoliticaDePrivacidadePage(): JSX.Element {
  return (
    <LegalPage
      title="Política de Privacidade"
      version={PRIVACY_POLICY_VERSION}
      summary={
        <ul>
          <li>Coletamos só o necessário para a conta, as vagas e os pagamentos.</li>
          <li>Não vendemos dados e não usamos seus dados para publicidade.</li>
          <li>
            A empresa fica anônima: o contato dela só aparece para quem desbloqueia a
            vaga.
          </li>
          <li>
            No seu perfil, em <strong>Privacidade e dados</strong>, você baixa uma cópia
            de tudo e exclui a conta quando quiser.
          </li>
        </ul>
      }
    >
      <section>
        <h2>1. Quem cuida dos seus dados</h2>
        <p>
          O Eteron Hub (eteronhub.com.br) é um marketplace que liga empresas de metalurgia
          e estruturas metálicas a trabalhadores do setor. Para a Lei Geral de Proteção de
          Dados (Lei nº 13.709/2018, “LGPD”), somos o <em>controlador</em> dos dados
          tratados na plataforma.
        </p>
        <p>
          O encarregado pelo tratamento de dados (DPO) atende pelo e-mail {mail}. É por
          ele que você exerce seus direitos ou tira dúvidas sobre esta política.
        </p>
      </section>

      <section>
        <h2>2. Que dados coletamos, para quê e por quanto tempo</h2>
        <p>
          A tabela abaixo lista cada dado com a finalidade, a base legal da LGPD que
          autoriza o uso e o tempo de guarda. Não coletamos dados sensíveis (origem
          racial, saúde, religião, biometria e afins).
        </p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th scope="col">Dado</th>
                <th scope="col">De quem</th>
                <th scope="col">Para quê</th>
                <th scope="col">Base legal</th>
                <th scope="col">Guarda</th>
              </tr>
            </thead>
            <tbody>
              {DATA_MAP.map((row) => (
                <tr key={row.data}>
                  <th scope="row">{row.data}</th>
                  <td data-label="De quem">{row.who}</td>
                  <td data-label="Para quê">{row.why}</td>
                  <td data-label="Base legal">{row.basis}</td>
                  <td data-label="Guarda">{row.keep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>3. O que não fazemos</h2>
        <ul>
          <li>Não vendemos nem alugamos dados pessoais.</li>
          <li>Não usamos cookies de publicidade nem ferramentas de rastreamento.</li>
          <li>Não tomamos decisões automatizadas sobre você.</li>
          <li>
            Não enviamos e-mails de marketing. Se um dia fizermos isso, será só com o seu
            consentimento, que você poderá retirar quando quiser.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Anonimato das empresas</h2>
        <p>
          As vagas vão ao ar sem o nome da empresa. Nome e contato só aparecem para o
          trabalhador depois que ele desbloqueia a vaga e os créditos são debitados. Antes
          disso, nenhuma tela da plataforma mostra esses dados. A empresa, por sua vez,
          não recebe dados do trabalhador pela plataforma: é o trabalhador quem decide
          entrar em contato.
        </p>
      </section>

      <section>
        <h2>5. Com quem compartilhamos</h2>
        <ul>
          <li>
            <strong>Banco Inter</strong>, que gera as cobranças Pix na compra de créditos.
            A cobrança leva só o valor e a descrição; não enviamos seu nome nem seu CPF.
            Quando você paga, o seu banco e o Banco Inter tratam os dados do pagador como
            em qualquer Pix, sob as regras do Banco Central.
          </li>
          <li>
            <strong>Provedores de infraestrutura</strong>: o servidor em nuvem onde ficam
            a aplicação e o banco de dados, e a Cloudflare, que protege e entrega o site
            (por ela passa o tráfego, inclusive o seu IP). Eles tratam os dados só sob
            nossas instruções.
          </li>
          <li>
            <strong>Autoridades públicas</strong>, quando a lei ou uma ordem judicial
            obrigar.
          </li>
        </ul>
        <p>
          Alguns desses provedores podem processar dados fora do Brasil. Quando isso
          acontece, a transferência segue o art. 33 da LGPD, com as garantias contratuais
          oferecidas pelo próprio provedor.
        </p>
      </section>

      <section>
        <h2>6. Armazenamento no navegador e cookies</h2>
        <p>
          Para manter você conectado, guardamos o token da sessão no armazenamento local
          do navegador; ele é apagado quando você sai da conta. O aplicativo também guarda
          em cache arquivos do próprio site (imagens, estilos e scripts) para abrir mais
          rápido, sem dados pessoais. A Cloudflare pode gravar cookies técnicos de
          segurança. Não usamos cookies de análise nem de publicidade.
        </p>
      </section>

      <section>
        <h2>7. Segurança</h2>
        <ul>
          <li>Conexão sempre criptografada (HTTPS).</li>
          <li>
            Senhas guardadas só como hash bcrypt; ninguém da equipe consegue lê-las.
          </li>
          <li>Cada perfil de acesso só enxerga o que lhe cabe.</li>
          <li>
            CPF e CNPJ nunca são gravados em texto aberto nos registros da aplicação.
          </li>
        </ul>
        <p>
          Se acontecer um incidente de segurança que possa causar risco ou dano relevante,
          avisaremos você e a ANPD, como manda o art. 48 da LGPD.
        </p>
      </section>

      <section>
        <h2>8. Seus direitos</h2>
        <p>Pelo art. 18 da LGPD, você pode:</p>
        <ul>
          <li>confirmar se tratamos seus dados e acessar uma cópia deles;</li>
          <li>corrigir dados incompletos, errados ou desatualizados;</li>
          <li>pedir anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>levar seus dados para outro serviço (portabilidade);</li>
          <li>saber com quem compartilhamos seus dados;</li>
          <li>
            revogar um consentimento e se opor a tratamentos que considere irregulares;
          </li>
          <li>reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p>
          <strong>Como pedir:</strong> no seu perfil (
          <Link href="/painel/perfil">trabalhador</Link> ou{" "}
          <Link href="/empresa/perfil">empresa</Link>), a seção{" "}
          <strong>Privacidade e dados</strong> gera na hora a cópia completa em JSON e
          exclui a conta. Dados do perfil você corrige ali mesmo. Para os demais pedidos,
          escreva para {mail}; respondemos em até 15 dias.
        </p>
      </section>

      <section>
        <h2>9. O que acontece quando você exclui a conta</h2>
        <p>
          A exclusão é imediata e definitiva. Apagamos nome, e-mail, telefone, perfil
          profissional e, no caso de empresas, nome fantasia, contatos e localização. O
          acesso é encerrado e as vagas abertas da empresa saem do ar.
        </p>
        <p>
          Ficam guardados, sem uso para outros fins, apenas os dados que a lei manda
          manter: CPF ou CNPJ e razão social, o histórico de pagamentos, créditos e
          desbloqueios, e o registro dos aceites (art. 16 da LGPD). Esses registros são
          eliminados quando o prazo legal termina.
        </p>
      </section>

      <section>
        <h2>10. Menores de idade</h2>
        <p>
          O Eteron Hub é só para maiores de 18 anos, e o cadastro pede essa declaração. Se
          descobrirmos uma conta de menor, ela será excluída.
        </p>
      </section>

      <section>
        <h2>11. Mudanças nesta política</h2>
        <p>
          Quando o texto mudar, a versão e a data no topo da página mudam junto. Se a
          mudança for relevante, avisaremos pelo e-mail cadastrado e, quando a lei exigir,
          pediremos um novo aceite. Os <Link href="/termos-de-uso">Termos de Uso</Link>{" "}
          complementam esta política.
        </p>
      </section>
    </LegalPage>
  );
}
