
const ALLOWED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com"
]);

const ACTOR_ID = "qUM3Ovny6cGNYNnG0";

function findVideoUrl(value, depth = 0) {
  if (!value || depth > 8) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findVideoUrl(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value !== "object") return null;

  // Prioriza os campos específicos de download.
  const candidates = [
    value.downloadUrl,
    value.videoUrl,
    value.video_url,
    value.mediaUrl,
    value.media_url,
    value.playUrl,
    value.play_url
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;

    try {
      const parsed = new URL(candidate.trim());

      if (
        parsed.protocol === "https:" &&
        parsed.pathname.toLowerCase().includes(".mp4")
      ) {
        return parsed.href;
      }
    } catch {
      // Ignora endereços inválidos.
    }
  }

  for (const nested of Object.values(value)) {
    if (nested && typeof nested === "object") {
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

    if (!videoItem) {
      return res.status(200).json({
        sucesso: true,
        embed: `https://www.instagram.com/${match[1]}/${match[2]}/embed/`,
        downloadDisponivel: false,
        mensagem: "Não foi encontrado um vídeo nesta publicação."
      });
    }

    // Primeiro tenta o endereço específico dentro de downloads.
    const downloadUrl =
      videoItem?.downloads?.find(item =>
        typeof item?.downloadUrl === "string" &&
        item.downloadUrl.startsWith("https://")
      )?.downloadUrl ||
      videoItem?.videoUrl ||
      findVideoUrl(videoItem);

    const embedUrl =
      `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;

    if (!downloadUrl) {
      console.log("Vídeo encontrado, mas sem URL de download.");

      return res.status(200).json({
        sucesso: true,
        embed: embedUrl,
        thumbnail: videoItem.thumbnailUrl || null,
        downloadDisponivel: false,
        mensagem: "Não foi possível obter o endereço de download."
      });
    }

    // Confirma que o endereço é HTTPS.
    let validDownloadUrl;

    try {
      validDownloadUrl = new URL(downloadUrl);

      if (validDownloadUrl.protocol !== "https:") {
        throw new Error("URL insegura");
      }
    } catch {
      return res.status(502).json({
        sucesso: false,
        erro: "O endereço do vídeo retornado é inválido."
      });
    }

    console.log("Link de vídeo encontrado com sucesso.");

    return res.status(200).json({
      sucesso: true,
      embed: embedUrl,
      thumbnail: videoItem.thumbnailUrl || null,
      downloadDisponivel: true,
      downloadUrl: validDownloadUrl.href,
      formato: "MP4",
      duracao: videoItem.videoDuration || null,
      largura: videoItem.downloads?.[0]?.largura || null,
      altura: videoItem.downloads?.[0]?.altura || null,
      autor: videoItem.autorUsername || null
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


