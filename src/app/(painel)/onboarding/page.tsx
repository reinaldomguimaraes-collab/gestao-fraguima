const PASSOS = [
  { titulo: "Dashboard", texto: "Aqui você vê o resumo financeiro do mês: faturamento, custo fixo, resultado e o progresso das suas metas." },
  { titulo: "Parâmetros da Empresa", texto: "Configure uma vez: regime tributário, percentuais padrão e horas úteis/mês. Esses valores viram o padrão da Precificação." },
  { titulo: "Cadastros", texto: "Cadastre funcionários, veículos e terceirizados — o Custo Mensal e o Valor Hora de cada um são calculados sozinhos." },
  { titulo: "Custos Fixos", texto: "Veja a lista única de despesas, somando Folha de Pagamento, Veículos e as despesas gerais que você cadastrar." },
  { titulo: "Metas Comerciais", texto: "Defina meta, ticket médio e % de conversão de cada frente — o sistema calcula quantas vendas e quantos leads você precisa." },
  { titulo: "Vendas", texto: "Lance cada venda realizada. Dá pra editar enquanto o mês está aberto, sempre com um motivo registrado." },
  { titulo: "Precificação", texto: "Duas calculadoras — Venda de Usina e Serviços — que chegam ao preço somando percentuais sobre o custo." },
  { titulo: "Fluxo de Caixa", texto: "Acompanhe entradas e saídas previstas x realizadas, mês a mês, com o saldo acumulado." }
];

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display mb-1 text-xl font-bold text-ink">Bem-vindo ao Duo Fraguima</h1>
      <p className="caption mb-6">Um resumo rápido de cada parte do painel — você pode rever isso quando quiser em Configurações.</p>

      <div className="flex flex-col gap-3">
        {PASSOS.map((p, i) => (
          <div key={p.titulo} className="card flex gap-4">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              {i + 1}
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{p.titulo}</div>
              <p className="caption mt-0.5">{p.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <a href="/dashboard" className="btn btn-primary mt-6">
        Ir para o Dashboard
      </a>
    </div>
  );
}
