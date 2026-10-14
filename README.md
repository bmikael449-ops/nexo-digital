# Nexo Digital

Site institucional da **Nexo Digital**, com apresentação dos serviços e formulário de orçamento que envia a solicitação pelo WhatsApp.

Projeto estático (HTML, CSS e JavaScript puros), sem build e sem dependências.

## Estrutura

```
nexo-digital/
├── index.html        # Página principal
├── 404.html          # Página de erro
├── css/
│   └── style.css     # Estilos
├── js/
│   └── main.js       # Serviços, formulário e WhatsApp
├── assets/
│   └── favicon.svg   # Ícone do site
├── robots.txt
├── vercel.json       # Configuração de deploy (Vercel)
├── package.json
└── README.md
```

## Rodar localmente

Opção 1: dê duplo clique no `index.html` para abrir no navegador.

Opção 2: com servidor local:

```bash
npm run dev
```

Depois acesse http://localhost:3000.

## Deploy na Vercel

1. Importe este repositório em [vercel.com/new](https://vercel.com/new).
2. Framework Preset: **Other**. Deixe Build Command e Output Directory vazios.
3. Clique em **Deploy**.

Cada `git push` na branch `main` publica uma nova versão automaticamente.

## Personalização

- **WhatsApp:** altere o número na constante `WHATSAPP` em `js/main.js` e no link `wa.me` do botão flutuante em `index.html`.
- **Serviços:** edite a lista `servicos` em `js/main.js`.
- **Cores:** variáveis no topo de `css/style.css` (`:root`).
- **Domínio próprio:** Vercel → Project → Settings → Domains.
