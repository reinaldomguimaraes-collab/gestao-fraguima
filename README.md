# Duo Fraguima — Painel de Gestão de Clientes

Aplicação real (Next.js + Postgres) do painel de gestão financeira para
instaladoras de energia solar, construída a partir da especificação e do
mockup validados (Estágios 1 e 2).

Para colocar isso no ar, veja o **[SETUP.md](./SETUP.md)** — passo a passo de
GitHub, Coolify, banco de dados, login com Google e criação da primeira
conta.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Postgres** via **Prisma ORM**
- **NextAuth (Auth.js) v5** — login por e-mail/senha ou Google, dois tipos de
  conta (equipe interna da Duo Fraguima e empresas clientes)
- Pronto para rodar em **Docker**, no Coolify que você já tem configurado

## Estrutura

```
prisma/schema.prisma      modelo de dados completo (todas as entidades da especificação)
src/auth.ts                configuração de autenticação (credenciais + Google)
src/middleware.ts          controle de acesso: login obrigatório, papéis, isolamento Administrativo x Cliente
src/lib/session.ts         requireCliente()/requireInterno()/requireProprietario() — toda tela usa isso, nunca um id vindo de fora
src/lib/calc/              motor de cálculo: Valor Hora, Custos Fixos, Precificação (cascata de percentuais)
src/app/(auth)/            login, definir senha (1º acesso), aceite de termos
src/app/(admin)/           painel interno da Duo Fraguima: Clientes e Equipe
src/app/(painel)/          painel do cliente: as 9 telas (Dashboard, Parâmetros, Cadastros, Custos Fixos, Metas, Vendas, Precificação, Fluxo de Caixa, Plano de Negócio) + Onboarding/Configurações
```

## Notas de implementação (pequenas diferenças em relação ao mockup)

O mockup (Estágio 2) usava janelas modais para "Novo cliente" e "Convidar
colaborador" — aqui elas viraram páginas próprias (`/administrativo/novo`,
`/administrativo/equipe/novo`). O fluxo e os campos são exatamente os
mesmos; só a mecânica de abrir um formulário mudou, para manter o código mais
simples e robusto numa aplicação real.

A calculadora de Precificação funciona sem JavaScript no navegador: os
campos viram parâmetros na própria URL e a página recalcula no servidor a
cada "Calcular" — então ela sempre reflete o que está salvo em Parâmetros da
Empresa, Custos Fixos e Metas Comerciais.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL de um Postgres local e AUTH_SECRET
npx prisma migrate dev --name inicial
SEED_OWNER_EMAIL="voce@email.com" npm run db:seed
npm run dev
```
