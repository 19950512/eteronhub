export const metadata = {
  title: "Política de Privacidade | EteronHub",
  description:
    "Como o Eteron Hub coleta, usa, compartilha e protege os dados pessoais de empresas e trabalhadores, conforme a LGPD.",
};

const CONTACT_EMAIL = "privacidade@eteronhub.com";
const LAST_UPDATE = "14 de setembro de 2026";

export default function PoliticaDePrivacidadePage(): JSX.Element {
  return (
    <div className="stack policy">
      <div>
        <h1>Política de Privacidade</h1>
        <p className="text-muted">Última atualização: {LAST_UPDATE}</p>
      </div>

      <section className="card">
        <p className="text-muted">
          Este é um texto genérico, fornecido como modelo inicial. Ele ainda precisa de
          revisão jurídica antes do lançamento e não substitui a orientação de um
          advogado.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">1. Quem somos e escopo desta política</h2>
        <p className="text-muted">
          O Eteron Hub é um marketplace B2B do setor de metalurgia e estruturas metálicas
          que conecta empresas a trabalhadores e prestadores de serviço. Para os fins da
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD), o Eteron Hub atua
          como controlador dos dados pessoais tratados na plataforma.
        </p>
        <p className="text-muted">
          Esta política se aplica ao site, ao aplicativo web e a todos os serviços do
          Eteron Hub, e vale tanto para visitantes não cadastrados quanto para empresas e
          trabalhadores com conta ativa.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">2. Dados que coletamos</h2>
        <p className="text-muted">
          <strong>Dados de cadastro de empresa:</strong> razão social, nome fantasia,
          CNPJ, e-mail, telefone e dados de contato da pessoa responsável.
        </p>
        <p className="text-muted">
          <strong>Dados de cadastro de trabalhador:</strong> nome, e-mail, telefone, CPF e
          informações profissionais informadas por você.
        </p>
        <p className="text-muted">
          <strong>Dados de vagas:</strong> descrição, localização, faixa salarial e demais
          informações publicadas pelas empresas, além do histórico de moderação de cada
          vaga.
        </p>
        <p className="text-muted">
          <strong>Dados de pagamento:</strong> informações necessárias para gerar e
          conciliar cobranças Pix na compra de créditos, como valor, identificador da
          transação e data de confirmação. Não armazenamos dados de cartão de crédito.
        </p>
        <p className="text-muted">
          <strong>Dados de uso:</strong> registros de acesso, endereço IP, data e hora das
          requisições e eventos de desbloqueio de vagas, usados para segurança, auditoria
          e suporte.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">3. Finalidades e bases legais</h2>
        <p className="text-muted">
          <strong>Execução de contrato:</strong> criar e manter sua conta, publicar e
          moderar vagas, processar a compra de créditos e liberar o desbloqueio dos dados
          de contato das empresas.
        </p>
        <p className="text-muted">
          <strong>Cumprimento de obrigação legal ou regulatória:</strong> guarda de
          registros de acesso, emissão de documentos fiscais e atendimento a requisições
          de autoridades competentes.
        </p>
        <p className="text-muted">
          <strong>Legítimo interesse:</strong> prevenção a fraudes, segurança da
          plataforma, auditoria de transações financeiras e melhoria dos nossos serviços,
          sempre com avaliação do impacto sobre seus direitos.
        </p>
        <p className="text-muted">
          <strong>Consentimento:</strong> envio de comunicações de marketing, quando
          aplicável. Você pode revogar seu consentimento a qualquer momento, sem prejuízo
          do uso da plataforma.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">4. Compartilhamento com terceiros</h2>
        <p className="text-muted">
          Não vendemos seus dados pessoais. Compartilhamos informações apenas com:
          instituição financeira responsável pelo processamento das cobranças Pix;
          provedores de infraestrutura, hospedagem e monitoramento que operam sob contrato
          e nossas instruções; e autoridades públicas, quando houver obrigação legal ou
          ordem judicial.
        </p>
        <p className="text-muted">
          As vagas são publicadas de forma anônima: os dados de identificação e contato da
          empresa só são revelados ao trabalhador após o desbloqueio pago da vaga, com o
          consumo de créditos confirmado. Antes disso, esses dados não são exibidos na
          plataforma.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">5. Cookies e tecnologias similares</h2>
        <p className="text-muted">
          Utilizamos o armazenamento local do navegador para guardar o token da sua sessão
          e manter você autenticado entre as páginas. Esse dado é essencial para o
          funcionamento da plataforma e é apagado quando você sai da conta. Também podemos
          usar cookies e tecnologias equivalentes para segurança e métricas agregadas de
          uso.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">6. Retenção e segurança</h2>
        <p className="text-muted">
          Mantemos seus dados pelo tempo necessário para as finalidades descritas nesta
          política e pelos prazos legais aplicáveis, especialmente os registros
          financeiros e de auditoria, que são imutáveis por exigência de consistência e
          prestação de contas.
        </p>
        <p className="text-muted">
          Adotamos medidas técnicas e organizacionais de proteção, incluindo criptografia
          em trânsito (HTTPS obrigatório), controle de acesso rígido aos dados pessoais e
          a regra de nunca registrar CPF ou CNPJ em texto aberto nos logs da aplicação.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">7. Seus direitos como titular</h2>
        <p className="text-muted">
          A LGPD garante a você o direito de confirmar a existência de tratamento, acessar
          seus dados, corrigir dados incompletos ou desatualizados, solicitar
          anonimização, bloqueio ou eliminação de dados desnecessários, pedir a
          portabilidade a outro fornecedor, obter informação sobre os terceiros com quem
          compartilhamos dados, revogar o consentimento e opor-se a tratamentos realizados
          com base em legítimo interesse.
        </p>
        <p className="text-muted">
          Alguns dados podem ser mantidos mesmo após um pedido de exclusão, quando houver
          obrigação legal de guarda ou necessidade de defesa em processo.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">8. Canal de contato</h2>
        <p className="text-muted">
          Para exercer seus direitos ou tirar dúvidas sobre esta política, escreva para{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Respondemos às
          solicitações nos prazos previstos na LGPD.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title">9. Alterações desta política</h2>
        <p className="text-muted">
          Podemos atualizar esta política para refletir mudanças na plataforma ou na
          legislação. A data da última atualização fica sempre no topo desta página e, em
          caso de alteração relevante, avisaremos pelos canais de contato cadastrados.
        </p>
      </section>
    </div>
  );
}
