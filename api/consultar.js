
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Utilize POST."
    });
  }

  try {
    const { url } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        sucesso: false,
        erro: "Cole um link do Instagram."
      });
    }

    const parsed = new URL(url.trim());

    if (![
      "instagram.com",
      "www.instagram.com",
      "m.instagram.com"
    ].includes(parsed.hostname)) {
      return res.status(400).json({
        sucesso: false,
        erro: "O endereço não pertence ao Instagram."
      });
    }

    const match = parsed.pathname.match(
      /^\/(reel|reels|p|tv)\/([a-zA-Z0-9_-]+)\/?$/
    );

    if (!match) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de publicação inválido."
      });
    }

    return res.status(200).json({
      sucesso: true,
      codigo: match[2],
      embed: `https://www.instagram.com/${match[1]}/${match[2]}/embed/`,
      downloadDisponivel: false,
      mensagem: "Link identificado corretamente."
    });

  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      erro: "Link inválido ou malformado."
    });
  }
}


