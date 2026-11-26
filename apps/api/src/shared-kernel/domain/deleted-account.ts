import { Email } from "./email.vo";

export const DELETED_ACCOUNT_NAME = "Conta excluída";

// why: não é um hash bcrypt válido (60 caracteres), então nenhuma senha confere
// — mesmo que alguém chegasse ao registro pelo e-mail anonimizado.
export const DELETED_ACCOUNT_PASSWORD_HASH = "!conta-excluida";

// why: e-mail é único e obrigatório no banco; o domínio .invalid (RFC 2606)
// nunca recebe mensagem e libera o e-mail real para um novo cadastro.
export function deletedAccountEmail(accountId: string): Email {
  return Email.create(`excluida-${accountId}@conta-excluida.invalid`);
}
