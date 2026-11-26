import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "../../components/legal/legal-page";
import { SUPPORT_CONTACT_EMAIL, TERMS_OF_USE_VERSION } from "../../lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Regras de uso do Eteron Hub para trabalhadores e empresas: conta, créditos, desbloqueio de vagas, publicação, moderação e responsabilidades.",
};

const mail = <a href={`mailto:${SUPPORT_CONTACT_EMAIL}`}>{SUPPORT_CONTACT_EMAIL}</a>;

export default function TermosDeUsoPage(): JSX.Element {
  return (
    <LegalPage
      title="Termos de Uso"
      version={TERMS_OF_USE_VERSION}
      summary={
        <ul>
          <li>O Eteron Hub aproxima empresas e trabalhadores; não contrata ninguém.</li>
          <li>Trabalhador paga créditos via Pix para ver o contato de uma vaga.</li>
          <li>
            Empresa publica vagas reais, que passam por moderação antes de ir ao ar.
          </li>
          <li>Só maiores de 18 anos. Você pode excluir a conta quando quiser.</li>
        </ul>
      }
    >
      <section>
        <h2>1. O que é o Eteron Hub</h2>
        <p>
          O Eteron Hub é uma plataforma on-line que liga empresas de metalurgia,
          caldeiraria, soldagem e estruturas metálicas a trabalhadores e prestadores de
          serviço do setor. Somos intermediários: não somos agência de emprego, não
          participamos da seleção nem da contratação, e não somos parte do acordo entre
          empresa e trabalhador.
        </p>
        <p>
          Ao criar uma conta, você declara que leu e aceita estes Termos e a{" "}
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>
      </section>

      <section>
        <h2>2. Quem pode usar</h2>
        <ul>
          <li>Pessoas com 18 anos ou mais e plena capacidade civil.</li>
          <li>
            Empresas com CNPJ ativo no Brasil. Quem cadastra a empresa declara ter poderes
            para representá-la.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Sua conta</h2>
        <ul>
          <li>Os dados do cadastro precisam ser verdadeiros e seus.</li>
          <li>Cada CPF e cada CNPJ pode ter uma conta só.</li>
          <li>
            A senha é pessoal. Se perceber uso indevido da conta, avise em {mail} o quanto
            antes.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Para trabalhadores: créditos e desbloqueio</h2>
        <ul>
          <li>
            Os créditos são comprados em pacotes, pagos via Pix. Eles entram na carteira
            só depois que o banco confirma o pagamento; cobranças não pagas no prazo
            expiram sem gerar créditos.
          </li>
          <li>
            Cada vaga mostra quantos créditos custa para desbloquear. Ao desbloquear, você
            vê o nome da empresa e os contatos que ela informou. Abrir de novo uma vaga já
            desbloqueada não cobra outra vez.
          </li>
          <li>Os créditos não têm prazo de validade enquanto a conta existir.</li>
          <li>
            <strong>Arrependimento:</strong> créditos ainda não usados podem ser
            devolvidos em até 7 dias da compra (art. 49 do Código de Defesa do
            Consumidor). Peça em {mail}; a devolução é feita por Pix.
          </li>
          <li>
            Créditos já usados num desbloqueio não são devolvidos, porque o contato já foi
            entregue. Se o contato estiver errado ou a vaga for falsa, escreva para {mail}
            : analisamos o caso e podemos devolver os créditos.
          </li>
          <li>
            Desbloquear uma vaga não garante entrevista nem contratação. A conversa daí em
            diante é entre você e a empresa.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Para empresas: publicação de vagas</h2>
        <ul>
          <li>
            Publique só vagas reais e abertas, de acordo com a legislação trabalhista. A
            empresa responde pelo conteúdo da vaga e pelos contatos informados nela.
          </li>
          <li>
            É proibido: exigir pagamento do candidato; anunciar vaga falsa ou só para
            coletar dados; discriminar por sexo, origem, cor, estado civil, idade,
            deficiência ou qualquer outro motivo vedado em lei (Lei nº 9.029/1995).
          </li>
          <li>
            Toda vaga passa por moderação antes de ir ao ar. Uma vaga reprovada volta com
            o motivo e pode ser corrigida e reenviada.
          </li>
          <li>
            A vaga é publicada sem o nome da empresa. Nome e contato só aparecem para quem
            desbloqueia. Vagas publicadas saem do ar sozinhas depois do prazo de exibição,
            e a empresa pode encerrá-las antes.
          </li>
          <li>
            Hoje, publicar vagas não tem custo para a empresa. Se isso mudar, avisaremos
            com antecedência.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Uso proibido</h2>
        <p>Em qualquer tipo de conta, não é permitido:</p>
        <ul>
          <li>criar contas falsas ou em nome de terceiros;</li>
          <li>
            copiar dados da plataforma de forma automatizada, burlar o desbloqueio ou
            revender contatos obtidos aqui;
          </li>
          <li>usar os contatos para spam, assédio ou qualquer fim que não a vaga;</li>
          <li>tentar invadir, sobrecarregar ou atrapalhar o funcionamento do serviço.</li>
        </ul>
      </section>

      <section>
        <h2>7. Moderação e suspensão</h2>
        <p>
          Podemos reprovar ou tirar do ar vagas e suspender contas que descumpram estes
          Termos ou a lei, inclusive após denúncia. Sempre que possível, informamos o
          motivo. Uma suspensão impede o acesso, mas não apaga os registros que a lei
          manda guardar.
        </p>
      </section>

      <section>
        <h2>8. Responsabilidades</h2>
        <p>
          Revisamos as vagas antes da publicação, mas não conseguimos verificar tudo o que
          empresas e trabalhadores informam. Não respondemos por acordos, contratações,
          pagamentos ou disputas entre eles. Trabalhamos para manter o serviço no ar, mas
          podem ocorrer interrupções para manutenção ou por falhas de terceiros. Nada
          nestes Termos limita os direitos que o Código de Defesa do Consumidor garante a
          quem é consumidor.
        </p>
      </section>

      <section>
        <h2>9. Encerramento da conta</h2>
        <p>
          Você pode excluir a conta a qualquer momento no seu perfil, em{" "}
          <strong>Privacidade e dados</strong>. A exclusão é definitiva: créditos que
          sobrarem na carteira deixam de poder ser usados (peça antes a devolução, se
          estiver no prazo do item 4). O que é apagado e o que fica guardado por lei está
          na <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>
      </section>

      <section>
        <h2>10. Mudanças nestes Termos</h2>
        <p>
          Quando o texto mudar, a versão e a data no topo da página mudam junto. Mudanças
          relevantes são avisadas pelo e-mail cadastrado e, quando necessário, pediremos
          um novo aceite para continuar usando a plataforma.
        </p>
      </section>

      <section>
        <h2>11. Lei aplicável e contato</h2>
        <p>
          Estes Termos seguem a lei brasileira. Para quem é consumidor, vale o foro do
          próprio domicílio. Dúvidas sobre estes Termos: {mail}.
        </p>
      </section>
    </LegalPage>
  );
}
