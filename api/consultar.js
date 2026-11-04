
const ALLOWED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com"
]);

const ACTOR_ID = "qUM3Ovny6cGNYNnG0";

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
      return res.status(400).json({ sucesso: false, erro: "Cole um link válido." });
    }

    const parsed = new URL(url.trim());

    if (
      parsed.protocol !== "https:" ||
      !ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())
    ) {
      return res.status(400).json({ sucesso: false, erro: "Link inválido do Instagram." });
    }

    const match = parsed.pathname.match(/^\/(reel|reels|p|tv)\/([a-zA-Z0-9_-]+)\/?$/);

    if (!match) {
      return res.status(400).json({ sucesso: false, erro: "Formato de publicação não reconhecido." });
    }

    const token = process.env.APIFY_TOKEN;

    if (!token) {
      return res.status(500).json({ sucesso: false, erro: "Token do serviço não configurado." });
    }

    const endpoint = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&format=json`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: parsed.href }),
      signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
      return res.status(502).json({ sucesso: false, erro: "O Apify não conseguiu processar o vídeo." });
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [data];

    const keys = [
      "downloadUrl",
      "videoUrl",
      "video_url",
      "mediaUrl",
      "media_url",
      "url"
    ];

    let downloadUrl = null;

    for (const item of items) {
      for (const key of keys) {
        const value = item?.[key];

        if (typeof value === "string") {
          try {
            const candidate = new URL(value);
            if (candidate.protocol === "https:") {
              downloadUrl = candidate.href;
              break;
            }
          } catch {}
        }
      }
      if (downloadUrl) break;
    }

    if (!downloadUrl) {
      return res.status(502).json({
        sucesso: false,
        erro: "O Apify não retornou um link de vídeo reconhecido."
      });
    }

    return res.status(200).json({
      sucesso: true,
      downloadDisponivel: true,
      downloadUrl
    });

  } catch (error) {
    return res.status(500).json({
      sucesso: false,
      erro: "Não foi possível processar o vídeo. Tente novamente."
    });
  }
}
