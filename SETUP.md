# Duo Fraguima — Gestão Empresarial — Guia de publicação

Este guia parte do que você já tem pronto: VPS na Hostinger, Docker + Coolify
instalados e rodando, DNS no Registro.br já apontando `gestao.fraguima.com.br`
para o IP do VPS, e um projeto "Gestão de Clientes" já criado no Coolify.

O que falta é o que este projeto resolve: o código-fonte, e dois cadastros
externos (GitHub e Google Cloud Console).

## 1. Criar o repositório no GitHub

1. Entre em [github.com/new](https://github.com/new) e crie um repositório
   (pode ser privado) — sugestão de nome: `duo-fraguima-gestao`.
2. Na pasta deste projeto (depois de extrair o zip), rode:

   ```bash
   cd duo-fraguima
   git init
   git add .
   git commit -m "Primeira versão do painel"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/duo-fraguima-gestao.git
   git push -u origin main
   ```

## 2. Conectar o repositório no Coolify

1. Abra o projeto "Gestão de Clientes" que você já criou no Coolify.
2. Adicione um novo recurso do tipo **Aplicação** (não "banco de dados" — o
   banco é o próximo passo).
3. Escolha a fonte **GitHub** e selecione o repositório que você acabou de
   criar.
4. O Coolify detecta o `Dockerfile` na raiz do projeto automaticamente — não
   precisa configurar build pack manualmente.
5. Em **Domínios**, aponte para `gestao.fraguima.com.br` (o DNS já está
   pronto, então o Coolify só precisa emitir o certificado HTTPS).

## 3. Criar o banco Postgres

1. No mesmo projeto do Coolify, adicione um recurso do tipo **Postgres**
   (gerenciado pelo próprio Coolify).
2. Depois de criado, copie a "Connection String" — é esse valor que vai na
   variável `DATABASE_URL` da aplicação (ver item 4).

## 4. Variáveis de ambiente

Na aplicação, dentro do Coolify, configure estas variáveis (veja também
`.env.example` no projeto):

| Variável | O que é |
|---|---|
| `DATABASE_URL` | A connection string do Postgres do passo 3 |
| `AUTH_SECRET` | Gere com `openssl rand -base64 32` — qualquer valor aleatório longo |
| `NEXTAUTH_URL` | `https://gestao.fraguima.com.br` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Ver passo 5 abaixo |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Opcional — sem isso, os e-mails de convite só aparecem no log do servidor, o que serve para testar antes de contratar um serviço de e-mail transacional (ex.: Resend, SES, Mailgun) |

## 5. Login com Google — criar as credenciais

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie
   um projeto (ex.: "Duo Fraguima").
2. Vá em **APIs e Serviços → Tela de consentimento OAuth**, escolha
   "Externo", preencha nome do app e e-mail de contato — não precisa de
   verificação do Google para uso próprio/poucos usuários.
3. Vá em **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente
   OAuth**, tipo "Aplicativo da Web".
4. Em **URIs de redirecionamento autorizados**, adicione:
   `https://gestao.fraguima.com.br/api/auth/callback/google`
5. Copie o **Client ID** e o **Client Secret** gerados e cole nas variáveis
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` no Coolify.

Sem isso, o botão "Entrar com Google" aparece na tela mas o login falha —
e-mail/senha funciona normalmente mesmo sem esse passo.

## 6. Primeiro deploy e banco de dados

1. Dispare o deploy pelo Coolify (ele builda a imagem Docker e sobe o
   container).
2. Depois do primeiro deploy, rode as migrations do banco — pelo terminal
   que o Coolify oferece dentro do container da aplicação:

   ```bash
   npx prisma migrate deploy
   ```

   (Se for a primeira vez e você não tiver gerado uma migration ainda, rode
   antes, na sua máquina, com o `DATABASE_URL` apontando pro Postgres do
   Coolify: `npx prisma migrate dev --name inicial`, depois suba a pasta
   `prisma/migrations` gerada para o repositório e then `migrate deploy` no
   servidor.)

## 7. Criar sua própria conta (Proprietário)

Não existe tela de "criar minha conta" — por segurança, toda conta (cliente
ou da equipe) nasce de um convite. Para a primeiríssima conta (a sua, como
Proprietário), rode uma vez, com acesso ao banco de produção:

```bash
SEED_OWNER_EMAIL="reinaldo@seudominio.com.br" SEED_OWNER_NOME="Reinaldo" npm run db:seed
```

O comando imprime um link — abra-o para criar sua senha (ou, na mesma tela,
usar "Entrar com Google" com esse e-mail). A partir daí, você convida
colaboradores pelo próprio painel, em **Administrativo → Equipe**.

## Observação sobre este ambiente de construção

O projeto foi todo escrito e revisado aqui, mas este ambiente de nuvem não
tem acesso à rede de binários da Prisma (bloqueada pela política de rede do
sandbox), então não foi possível rodar `npm install` / `prisma generate` /
`next build` até o fim por aqui para testar de ponta a ponta. No seu VPS ou
num CI (GitHub Actions, por exemplo) isso roda normalmente, sem essa
restrição. Ainda assim, vale rodar `npm install` localmente ou no Coolify e
me avisar se algo não compilar — é rápido de ajustar.
