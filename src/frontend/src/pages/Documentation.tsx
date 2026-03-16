import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import { Globe, Info, Target, Lightbulb, Code } from 'lucide-react';

const docContent = {
  PT: {
    overview: `
# 📈 InvesteIA - Manual do Usuário

Bem-vindo ao **InvesteIA**, a sua plataforma definitiva para gerenciamento de Fundos de Investimentos Imobiliários. Nosso objetivo é simplificar o acompanhamento da sua carteira, proventos e fornecer *insights* valiosos.

## 🧭 Como Navegar
A aplicação é dividida em quatro áreas principais:

| Área | Descrição | Ícone |
| :--- | :--- | :---: |
| **Dashboard** | Visão geral da sua carteira, gráficos de distribuição por setor e resumo de proventos pendentes. | 📊 |
| **Carteira** | Gerenciamento dos seus ativos. Local para adicionar, editar ou remover FIIs, quantidade de cotas e preço médio. | 💼 |
| **Proventos** | Histórico e calendário de dividendos e JCP. Marque proventos como "Recebidos" para o controle do seu fluxo de caixa. | 💵 |
| **Análise** | Recomendações automáticas do sistema baseadas em indicadores fundamentalistas e cotação em tempo real. | 📈 |
`,
    analysis: `
## 🧠 Como Funciona a "Análise Inteligente"?

O InvesteIA utiliza integrações em tempo real (via *Brapi.dev*) para obter cotações atualizadas da B3. As recomendações geradas na aba **Análise** seguem a seguinte lógica baseada no **P/VP (Preço sobre Valor Patrimonial)**:

> **P/VP < 0.95**: 🟢 **Indicação de Compra** - O fundo está sendo negociado com "desconto", abaixo do seu valor justo de patrimônio.
>
> **P/VP entre 0.95 e 1.05**: 🟡 **Indicação de Manter** - O fundo está sendo negociado por um valor justo, próximo ao que ele realmente vale.
>
> **P/VP > 1.05**: 🔴 **Indicação de Venda** - O fundo está sobrepreçado, com ágio. Pode ser interessante aguardar uma correção no preço.
`,
    tips: `
## 💡 Dicas de Uso
- **Mantenha seu Preço Médio atualizado:** O cálculo de lucro/prejuízo no Dashboard depende diretamente do preço médio que você insere na tela de "Carteira".
- **Acompanhe a Data Com (Data Ex):** Na aba de "Proventos", fique de olho na coluna "Data Ex". Você precisa ter as cotas do fundo antes dessa data de corte para ter direito ao recebimento na "Data Pagamento".
- **Diversifique:** Utilize o gráfico de formato rosca no Dashboard para entender o peso de cada setor (Logística, Shopping, Papel, etc.) na sua carteira e equilibrar seus ativos!
`,
    tech: `
## 🛠️ Stack Tecnológica

O sistema InvesteIA foi construído utilizando tecnologias modernas e robustas:

* **Frontend:** \`React\`, \`TypeScript\`, \`Vite\`, \`Recharts\` (para os gráficos), e \`Lucide-react\` (iconografia).
* **Backend:** \`Node.js\`, \`Express\`, \`Prisma ORM\` (com banco \`SQLite\`), \`JWT\` e \`bcrypt\` (segurança de dados).
* **APIs de Terceiros:** Integração direta com \`Brapi.dev\` para obtenção segura de cotações em tempo real e fallback dinâmico (sistema de simulação e web-scraping interno com \`cheerio\`).
`
  },
  EN: {
    overview: `
# 📈 InvesteIA - User Manual

Welcome to **InvesteIA**, your definitive platform for Real Estate Investment Trusts (FIIs) management. Our goal is to simplify tracking your portfolio, dividends, and provide valuable *insights*.

## 🧭 How to Navigate
The application is divided into four main areas:

| Area | Description | Icon |
| :--- | :--- | :---: |
| **Dashboard** | Overview of your portfolio, sector distribution charts, and a summary of pending dividends. | 📊 |
| **Holdings** | Portfolio management. Your place to add, edit, or remove FIIs, quantity, and average price. | 💼 |
| **Dividends** | History and calendar of dividends and interest on equity (JCP). Mark dividends as "Received" to track cash flow. | 💵 |
| **Analysis** | Automatic system recommendations based on fundamental indicators and real-time quotes. | 📈 |
`,
    analysis: `
## 🧠 How does "Smart Analysis" work?

InvesteIA uses real-time integrations (via *Brapi.dev*) to fetch updated B3 quotes. The recommendations generated on the **Analysis** tab follow this logic based on the **P/VP (Price to Book Value Ratio)**:

> **P/VP < 0.95**: 🟢 **Buy Recommendation** - The fund is trading at a "discount", below its fair book value.
>
> **P/VP between 0.95 and 1.05**: 🟡 **Hold Recommendation** - The fund is trading near its fair intrinsic value.
>
> **P/VP > 1.05**: 🔴 **Sell Recommendation** - The fund is overpriced (premium). It might be interesting to wait for a price correction.
`,
    tips: `
## 💡 Usage Tips
- **Keep your Average Price updated:** The profit/loss calculation on the Dashboard depends directly on the average price you input in the "Holdings" screen.
- **Track the Ex-Date:** In the "Dividends" tab, keep an eye on the "Data Ex" column. You must own the fund's shares before this cutoff date to be entitled to receive the dividend on the "Pay Date".
- **Diversify:** Use the donut chart on the Dashboard to understand the weight of each sector (Logistics, Malls, Paper, etc.) in your portfolio, and balance your assets!
`,
    tech: `
## 🛠️ Tech Stack

The InvesteIA system is built using modern and robust technologies:

* **Frontend:** \`React\`, \`TypeScript\`, \`Vite\`, \`Recharts\` (for charts), and \`Lucide-react\` (iconography).
* **Backend:** \`Node.js\`, \`Express\`, \`Prisma ORM\` (with \`SQLite\` database), \`JWT\`, and \`bcrypt\` (data security).
* **Third-Party APIs:** Direct integration with \`Brapi.dev\` to securely fetch real-time quotes, along with dynamic fallbacks (internal simulation system and web-scraping using \`cheerio\`).
`
  }
};

type TabType = 'overview' | 'analysis' | 'tips' | 'tech';

export default function Documentation() {
  const [language, setLanguage] = useState<'PT' | 'EN'>('PT');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: Array<{ id: TabType; labelPT: string; labelEN: string; icon: React.ReactNode }> = [
    { id: 'overview', labelPT: 'Visão Geral', labelEN: 'Overview', icon: <Info size={18} /> },
    { id: 'analysis', labelPT: 'Análise Inteligente', labelEN: 'Smart Analysis', icon: <Target size={18} /> },
    { id: 'tips', labelPT: 'Dicas de Uso', labelEN: 'Usage Tips', icon: <Lightbulb size={18} /> },
    { id: 'tech', labelPT: 'Stack Tecnológica', labelEN: 'Tech Stack', icon: <Code size={18} /> },
  ];

  return (
    <Layout 
      title={language === 'PT' ? 'Documentação' : 'Documentation'} 
      subtitle={language === 'PT' ? 'Sobre o sistema InvesteIA' : 'About the InvesteIA system'}
      actions={
        <button 
          className="btn btn-secondary" 
          onClick={() => setLanguage(lang => lang === 'PT' ? 'EN' : 'PT')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Globe size={18} />
          {language === 'PT' ? 'Read in English' : 'Ler em Português'}
        </button>
      }
    >
      <div className="docs-tabs" style={{ marginTop: '2rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`docs-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {language === 'PT' ? tab.labelPT : tab.labelEN}
          </button>
        ))}
      </div>

      <div className="card tab-content" style={{ marginTop: '1.5rem' }}>
        <div className="markdown-body" style={{ lineHeight: '1.6' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {docContent[language][activeTab]}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  );
}
