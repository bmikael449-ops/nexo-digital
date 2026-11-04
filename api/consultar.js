
export default function handler(req, res) {
  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido. Utilize POST."
    });
  }

  try {
    const url = req.body?.url;

    if (typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        sucesso: false,
        erro: "Cole um link do Instagram."
      });
    }

    const parsed = new URL(url.trim());

    if (
      !["instagram.com", "www.instagram.com"].includes(
        parsed.hostname
      )
    ) {
      return res.status(400).json({
        sucesso: false,
        erro: "Link inválido do Instagram."
      });
    }

    const partes = parsed.pathname.split("/").filter(Boolean);

    if (
      !["reel", "reels", "p", "tv"].includes(partes[0]) ||
      !partes[1] ||
      !/^[a-zA-Z0-9_-]+$/.test(partes[1])
    ) {
      return res.status(400).json({
        sucesso: false,
        erro: "Publicação inválida."
      });
    }

    return res.status(200).json({
      sucesso: true,
      codigo: partes[1],
      embed:
        `https://www.instagram.com/${partes[0]}/${encodeURIComponent(partes[1])}/embed/`,
      downloadDisponivel: false
    });

  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      erro: "Não foi possível processar o link."
    });
  }
}
