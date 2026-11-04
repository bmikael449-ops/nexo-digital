
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
    return res.status(405).json({
      sucesso: false,
      erro: "Utilize POST."
    });
  }

  try {
    const { url } = req.body || {};

    if (typeof url !== "string" || url.length > 2000) {
      return res.status(400).json({
        sucesso: false,
        erro: "Cole um link válido."
      });
    }

    let parsed;

    try {
      parsed = new URL(url.trim());
    } catch {
      return res.status(400).json({
        sucesso: false,
        erro: "O link informado não é válido."
      });
    }

    if (
      parsed.protocol !== "https:" ||
      !ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())
    ) {
      return res.status(400).json({
        sucesso: false,
        erro: "Link inválido do Instagram."
      });
    }

    const match = parsed.pathname.match(
      /^\/(reel|reels|p|tv)\/([a-zA-Z0-9_-]+)\/?$/
    );

    if (!match) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de publicação não reconhecido."
      });
    }

    const token = process.env.APIFY_TOKEN;

    if (!token) {
      console.error("APIFY_TOKEN não configurado.");

      return res.status(500).json({
        sucesso: false,
        erro: "Serviço de download não configurado."
      });
    }

    const endpoint =
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items` +
      `?token=${encodeURIComponent(token)}&format=json`;

    console.log("Iniciando processamento no Apify.");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postUrls: [parsed.href]
      }),
      signal: AbortSignal.timeout(120000)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "ERRO APIFY:",
        response.status,
        responseText
      );

      return res.status(502).json({
        sucesso: false,
        erro: "O serviço de processamento retornou um erro.",
        status: response.status
      });
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Resposta inválida do Apify.");

      return res.status(502).json({
        sucesso: false,
        erro: "O Apify retornou uma resposta inválida."
      });
    }

    const items = Array.isArray(data) ? data : [data];

    const keys = [
      "downloadUrl",
      "videoUrl",
      "video_url",
      "mediaUrl",
      "media_url",
      "video",
      "url"
    ];

    let downloadUrl = null;

    for (const item of items) {
      for (const key of keys) {
        const value = item?.[key];

        if (typeof value !== "string") continue;

        try {
          const candidate = new URL(value);

          if (
            candidate.protocol === "https:" &&
            !ALLOWED_HOSTS.has(candidate.hostname.toLowerCase())
          ) {
            downloadUrl = candidate.href;
            break;
          }
        } catch {
          // Ignora valores que não sejam URLs.
        }
      }

      if (downloadUrl) break;
    }

    if (!downloadUrl) {
      console.error(
        "Nenhum link de vídeo reconhecido.",
        JSON.stringify(items).slice(0, 4000)
      );

      return res.status(502).json({
        sucesso: false,
        erro: "O Apify não retornou um link de vídeo reconhecido."
      });
    }

    console.log("Link de vídeo encontrado.");

    return res.status(200).json({
      sucesso: true,
      downloadDisponivel: true,
      downloadUrl
    });

  } catch (error) {
    console.error(
      "ERRO NA FUNÇÃO:",
      error?.name,
      error?.message
    );

    return res.status(500).json({
      sucesso: false,
      erro: error?.name === "TimeoutError"
        ? "O processamento demorou demais. Tente novamente."
        : "Não foi possível processar o vídeo."
    });
  }
}

