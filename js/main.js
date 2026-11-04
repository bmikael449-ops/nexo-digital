
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido."
    });
  }

  const url = req.body?.url;

  if (typeof url !== "string" || url.length > 2000) {
    return res.status(400).json({
      erro: "Informe um link válido."
    });
  }

  try {
    const parsed = new URL(url);

    if (
      !["instagram.com", "www.instagram.com"].includes(
        parsed.hostname
      )
    ) {
      return res.status(400).json({
        erro: "Este link não pertence ao Instagram."
      });
    }

    const partes = parsed.pathname.split("/").filter(Boolean);

    if (
      !["reel", "reels", "p", "tv"].includes(partes[0]) ||
      !partes[1] ||
      !/^[a-zA-Z0-9_-]+$/.test(partes[1])
    ) {
      return res.status(400).json({
        erro: "Link de publicação inválido."
      });
    }

    const codigo = partes[1];

    const tipo = partes[0];

    const embed =
      `https://www.instagram.com/${tipo}/${encodeURIComponent(codigo)}/embed/`;

    return res.status(200).json({
      sucesso: true,
      codigo,
      tipo,
      embed,
      downloadDisponivel: false,
      mensagem: "Publicação identificada."
    });

  } catch (error) {
    return res.status(400).json({
      erro: "Não foi possível validar o link."
    });
  }
}
