# VideoDown

Página inicial substituta do Nexo Digital, preparada para publicação na Vercel.

## Publicação

1. Substitua os arquivos do repositório pelos arquivos desta pasta.
2. Faça commit e aguarde a Vercel concluir o deploy.
3. A rota `/api/consultar` é uma função serverless da Vercel.

## Estado atual

A aplicação valida links HTTPS de Reels/publicações do Instagram e tenta mostrar a incorporação oficial (`/embed/`). A prévia pode não funcionar para conteúdos privados, removidos ou com incorporação desativada.

**O download MP4 não fica ativo sem um provedor autorizado.** Não existe uma forma confiável de obter o arquivo apenas identificando o código do Reel. A interface só mostra o botão de arquivo quando a API integrada realmente retorna uma URL HTTPS.

## Integração opcional de provedor

Na Vercel, em Project Settings > Environment Variables, configure:

- `VIDEODOWN_API_URL`: endpoint HTTPS do provedor.
- `VIDEODOWN_API_KEY`: chave privada do provedor.

A função envia `POST` com JSON `{ "url": "https://www.instagram.com/reel/..." }` e cabeçalho `Authorization: Bearer SUA_CHAVE`. O provedor precisa responder JSON com `downloadUrl` HTTPS. A chave fica no backend e não é exposta ao navegador.

O formato de resposta e a autenticação variam por fornecedor. Adapte `api/consultar.js` ao contrato documentado do serviço escolhido antes de configurar as variáveis. Não coloque chaves secretas no HTML ou em `js/main.js`.

A integração deve ser usada apenas com conteúdo que você tenha permissão para acessar e guardar.
