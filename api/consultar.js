
const ALLOWED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com"
]);

const ACTOR_ID = "qUM3Ovny6cGNYNnG0";

function findVideoUrl(value, depth = 0) {
  if (!value || depth > 6) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findVideoUrl(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value !== "object") return null;

  const keys = [
    "downloadUrl",
    "videoUrl",
    "video_url",
    "mediaUrl",
    "media_url",
    "video",
    "playUrl",
    "play_url",
    "url"
  ];

  for (const key of keys) {
    const valueUrl = value[key];

    if (typeof valueUrl !== "string") continue;

    try {
      const candidate = new URL(valueUrl);

      if (
        candidate.protocol === "https:" &&
        !ALLOWED_HOSTS.has(candidate.hostname.toLowerCase())
      ) {
        return candidate.href;
      }
    } catch {
      // Ignora URLs inválidas.
    }
  }

  for (const [key, nested] of Object.entries(value)) {
    if (
      typeof nested === "object" &&
      nested !== null
    ) {
      const found = findVideoUrl(nested, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

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
        erro: "Serviço de processamento não configurado."
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
        postUrls: [parsed.href],
        saveFiles: false
      }),
      signal: AbortSignal.timeout(120000)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "ERRO APIFY:",
        response.status,
        responseText.slice(0, 2000)
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
      return res.status(502).json({
        sucesso: false,
        erro: "O Apify retornou uma resposta inválida."
      });
    }

    const items = Array.isArray(data) ? data : [data];

    const videoItem = items.find(item =>
      String(item?.mediaType || "").toLowerCase() === "video"
    );

    const downloadUrl = findVideoUrl(
      videoItem || items
    );

    const embedUrl =
      `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;

    if (!downloadUrl) {
      console.log(
        "Publicação encontrada, mas sem URL de vídeo reconhecida."
      );

      return res.status(200).json({
        sucesso: true,
        embed: embedUrl,
        downloadDisponivel: false,
        mensagem:
          "Publicação encontrada, mas o provedor não retornou um endereço de vídeo disponível."
      });
    }

    console.log("Link de vídeo encontrado.");

    return res.status(200).json({
      sucesso: true,
      embed: embedUrl,
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
      erro:
        error?.name === "TimeoutError"
          ? "O processamento demorou demais. Tente novamente."
          : "Não foi possível processar o vídeo."
    });
  }
}

