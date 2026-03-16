# InvesteIA - Plano do Projeto

## Visão Geral
Webapp para gestão de carteira de Fundos de Investimento Imobiliário (FIIs), com análise automatizada de performance, proventos e recomendações de investimento.

---

## Funcionalidades Principais

### 1. Gestão de Carteira
- **Cadastro de FIIs**: Código do ativo (ex: HGLG11, MXRF11), quantidade de cotas, preço médio, data da compra
- **Histórico de compras**: Múltiplas compras do mesmo FII em datas diferentes
- **Dashboard da carteira**: Valor total investido, valor atual de mercado, saldo de proventos

### 2. Consulta de Dados (API)
- **Cotação atual**: Preço de mercado em tempo real
- **DY (Dividend Yield)**: Rentabilidade por proventos
- **P/VP**: Preço sobre Valor Patrimonial (indicador de "caro" ou "barato")
- **Último provento**: Valor e tipo (dividendo, JCP, desdobramento)
- **Data do próximo provento**: Quando será pago
- **Yield on Cost**: Proventos recebidos / custo de aquisição

### 3. Análise e Recomendações
- **Status do FII**: "Comprar", "Manter", "Vender" baseado em:
  - P/VP abaixo de 0.95 → Potencial compra
  - P/VP entre 0.95-1.05 → Manter
  - P/VP acima de 1.05 → Sobrefcado, não comprar
- **Comparação de setores**: Shopping, Lajes, Papel, Logística, etc.
- **Sugestão de troca**: Identificar FIIs similares com melhor DY ou P/VP

### 4. Proventos
- **Calendário de proventos**: Meses esperados para cada FII
- **Histórico recebido**: Total de proventos por mês/ano
- **Projeção futura**: Estimativa de proventos nos próximos 12 meses
- **Tipo de provento**: Dividendo isento vs JCP (taxado)

### 5. Relatórios e Insights
- **Evolução patrimonial**: Gráfico do valor investido vs valor atual
- **Distribuição por setor**: Pie chart da alocação
- **Top 5 FIIs**: Por rentabilidade, DY, quantidade de proventos
- **Alertas**: FII com P/VP muito alto, provento não pago na data esperada

---

## Arquitetura Técnica

### Frontend
```
React + TypeScript
- Vite como build tool
- TailwindCSS para estilização
- Recharts para gráficos
- React Query para cache de API
```

### Backend
```
Node.js + Express (ou Python + FastAPI)
- SQLite para MVP (ou PostgreSQL para produção)
- Prisma como ORM
- JWT para autenticação
```

### APIs de Dados
- **Brapi.dev** (https://brapi.dev/) - Cotações de FIIs em tempo real
- **Fundamentus** (web scraping) - Indicadores fundamentais
- **Status Invest** (web scraping) - Histórico de proventos
- **B3** - Dados oficiais (opcional)

### Estrutura do Banco de Dados
```
users
  - id, email, password_hash

holdings
  - id, user_id, ticker, quantity, avg_price, purchase_date

dividends
  - id, holding_id, amount, type, ex_date, pay_date, status

fiis_metadata
  - ticker, name, sector, current_price, p_vp, dy_12m, last_dividend
  - next_dividend_date, updated_at
```

---

## Roadmap de Implementação

### Fase 1 - MVP (Semana 1-2)
- [ ] Setup do projeto (frontend + backend)
- [ ] Schema do banco de dados
- [ ] CRUD de holdings (adicionar FIIs comprados)
- [ ] Integração com Brapi.dev para ciação atual
- [ ] Dashboard básico: total investido, valor atual, proventos totais

### Fase 2 - Proventos (Semana 3-4)
- [ ] Web scraping do histórico de proventos (Fundamentus/Status Invest)
- [ ] Calendário de proventos por FII
- [ ] Cálculo de yield on cost
- [ ] Projeção de proventos futuros

### Fase 3 - Análise (Semana 5-6)
- [ ] Indicadores P/VP, DY, setor
- [ ] Sistema de recomendação (comprar/manter/vender)
- [ ] Comparação entre FIIs do mesmo setor
- [ ] Alertas de oportunidades

### Fase 4 - Polimento (Semana 7-8)
- [ ] Gráficos e visualizações
- [ ] Autenticação de usuários
- [ ] Exportar relatório (PDF/CSV)
- [ ] Deploy em produção (Vercel + Railway)

---

## Riscos e Considerações

### Dados
- APIs gratuitas podem ter limite de requisições
- Web scraping pode quebrar se o site mudar estrutura
- Dados de proventos podem estar desatualizados

### LGPD
- Dados financeiros dos usuários são sensíveis
- Necessário termo de uso e política de privacidade

### Disclaimer
- App é para **gestão**, não é recomendação de investimento
- Usuário deve fazer sua própria análise

---

## Próximos Passos Imediatos

1. **Validar APIs**: Testar Brapi.dev e verificar qualidade dos dados
2. **Definir stack**: Confirmar se usa Node ou Python no backend
3. **Prototipo UI**: Fazer wireframe das telas principais
4. **Setup inicial**: `npm create vite@latest` + backend boilerplate

---

## Tech Stack Sugerida

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| UI | TailwindCSS + shadcn/ui |
| Backend | Node.js 22 + Express |
| DB | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Deploy | Vercel (front) + Railway (back) |
| API externa | Brapi.dev + web scraping |
