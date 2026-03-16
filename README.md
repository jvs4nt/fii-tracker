# InvesteIA 📈

Uma aplicação web completa para rastrear e gerenciar sua carteira de Fundos de Investimento Imobiliário (FIIs), monitorar proventos e obter recomendações inteligentes com base em dados em tempo real.

## 🚀 Funcionalidades

*   **Autenticação de Usuário**: Login e registro seguros usando JWT e bcrypt.
*   **Gerenciamento de Carteira**: Adicione, edite e remova FIIs do seu portfólio. Acompanhe a quantidade, preço médio e data da compra.
*   **Rastreamento de Proventos**: 
    *   Sincroniza automaticamente ou permite a entrada manual de dividendos, JCP (Juros sobre Capital Próprio) e desdobramentos.
    *   Acompanha proventos pendentes vs. recebidos.
*   **Dashboard em Tempo Real**: Visualização da sua carteira por setor usando gráficos interativos (Recharts), mostrando o total investido, valor atual e lucro/prejuízo geral.
*   **Análise Inteligente**: 
    *   Busca automaticamente cotações em tempo real e o P/VP (Preço sobre Valor Patrimonial) na API Brapi.
    *   Fornece recomendações de "Comprar", "Manter" ou "Vender" com base no P/VP atual.
*   **Interface Responsiva**: Design limpo e moderno construído com React e ícones Lucide.

## 🛠️ Tecnologias Utilizadas

### Frontend
*   **React 19** com **Vite**
*   **TypeScript**
*   **React Router:** Para navegação
*   **Axios:** Para requisições na API
*   **Recharts:** Para visualização e gráficos
*   **Lucide React:** Para os ícones

### Backend
*   **Node.js** com **Express**
*   **TypeScript**
*   **Prisma ORM:** Gerenciamento do banco de dados e tipagem
*   **SQLite:** Banco de dados local super leve (não requer instalação)
*   **JWT (JSON Web Tokens):** Para segurança da API
*   **Axios & Cheerio:** Para raspagem de dados de mercado dos FIIs 

## ⚙️ Como Executar

### Pré-requisitos
*   Node.js (v18 ou superior recomendado)
*   npm (ou yarn)

### Instalação

1.  **Clone o repositório**.

2.  **Configuração do Backend:**
    ```bash
    cd src/backend
    npm install
    # O banco de dados SQLite já configurado.
    # Caso necessário, em caso de erro as iniciar o Prisma, execute:
    npx prisma generate
    # Inicie o servidor de desenvolvimento backend
    npm run dev
    ```
    O backend deve rodar em `http://localhost:3333`.

3.  **Configuração do Frontend:**
    Abra uma nova janela do terminal.
    ```bash
    cd src/frontend
    npm install
    # Inicie o servidor frontend
    npm run dev
    ```
    O frontend deve rodar na porta `http://localhost:5173` (ou até `5176`).

## 📡 Visão Geral das APIs

*   **Autenticação**: `POST /api/auth/register`, `POST /api/auth/login`
*   **Carteira**: `GET /api/holdings`, `POST /api/holdings`, `PUT /api/holdings/:id`, `DELETE /api/holdings/:id`
*   **Proventos**: `GET /api/dividends`, `POST /api/dividends`, `PUT /api/dividends/:id/receive`, `DELETE /api/dividends/:id`
*   **Dados FII**: `GET /api/fii/quote/:ticker`, `GET /api/fii/analysis`, `GET /api/fii/dashboard`

## 🔒 Segurança
O backend utiliza CORS para restringir acessos indevidos. Por padrão, ele aceita requisições das portas locais do cliente `http://localhost:5173` até `5176`. Para levar para produção, basta atualizar a variável `FRONTEND_URL` no arquivo `.env` do backend.
