const ALLOWED_HOSTS = new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ sucesso: false, erro: "Utilize POST." });
  }

  try {
    const { url } = req.body || {};
    if (typeof url !== "string" || url.length > 2000) {
      return res.status(400).json({ sucesso: false, erro: "Cole um link válido do Instagram." });
    }

    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
      return res.status(400).json({ sucesso: false, erro: "O endereço precisa ser um link HTTPS do Instagram." });
    }

    const match = parsed.pathname.match(/^\/(reel|reels|p|tv)\/([a-zA-Z0-9_-]+)\/?$/);
    if (!match) {
      return res.status(400).json({ sucesso: false, erro: "Formato de publicação não reconhecido." });
    }

    const [, tipo, codigo] = match;
    const embed = `https://www.instagram.com/${tipo}/${encodeURIComponent(codigo)}/embed/`;

    // Integração opcional: configure VIDEODOWN_API_URL e VIDEODOWN_API_KEY
    // na Vercel. O provedor precisa aceitar POST { url } e retornar
    // { downloadUrl: "https://...", title?: "...", thumbnail?: "https://..." }.
    const providerUrl = process.env.VIDEODOWN_API_URL;
    const providerKey = process.env.VIDEODOWN_API_KEY;

    if (providerUrl && providerKey) {
      let providerResponse;
      try {
        providerResponse = await fetch(providerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${providerKey}`
          },
          body: JSON.stringify({ url: parsed.href }),
          signal: AbortSignal.timeout(15000)
        });
      } catch {
        return res.status(502).json({ sucesso: false, erro: "O serviço de consulta está temporariamente indisponível." });
      }

      if (!providerResponse.ok) {
        return res.status(502).json({ sucesso: false, erro: "O provedor não conseguiu processar essa publicação." });
      }

      const providerData = await providerResponse.json().catch(() => null);
      const downloadUrl = providerData?.downloadUrl;
      let safeDownloadUrl = null;
      if (typeof downloadUrl === "string") {
        try {
          const candidate = new URL(downloadUrl);
          if (candidate.protocol === "https:") safeDownloadUrl = candidate.href;
        } catch { /* resposta do provedor sem URL válida */ }
      }

      return res.status(200).json({
        sucesso: true,
        codigo,
        embed,
        downloadDisponivel: Boolean(safeDownloadUrl),
        ...(safeDownloadUrl ? { downloadUrl: safeDownloadUrl } : {}),
        mensagem: safeDownloadUrl
          ? "O provedor disponibilizou o arquivo."
          : "A publicação foi identificada, mas o provedor não retornou um arquivo MP4."
      });
    }

    return res.status(200).json({
      sucesso: true,
      codigo,
      embed,
      downloadDisponivel: false,
      mensagem: "Link reconhecido. A prévia depende das permissões do Instagram. O download MP4 ainda precisa de um provedor autorizado."
    });
  } catch {
    return res.status(400).json({ sucesso: false, erro: "Link inválido ou malformado." });
  }
}
