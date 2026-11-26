export const SITE_NAME = "Eteron Hub";
export const SITE_DESCRIPTION =
  "Marketplace da metalurgia e estruturas metálicas: vagas moderadas para soldadores, caldeireiros, montadores e serralheiros, com contato direto com a empresa.";

// why: Open Graph exige URL absoluta; sem a variável usamos o domínio de produção
// (deploy/vps/docker-compose.yml) para o preview no WhatsApp nunca apontar para localhost.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eteronhub.com.br";

export const THEME_COLOR_LIGHT = "#ffffff";
export const THEME_COLOR_DARK = "#0e1319";
export const BRAND_INK = "#0e1319";
