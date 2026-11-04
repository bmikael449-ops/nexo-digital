const form = document.querySelector("#download-form");
const input = document.querySelector("#video-url");
const submitButton = document.querySelector("#submit-btn");
const pasteButton = document.querySelector("#paste-btn");
const statusBox = document.querySelector("#status");
const resultBox = document.querySelector("#result");
const previewBox = document.querySelector("#preview");
const downloadArea = document.querySelector("#download-area");

document.querySelector("#year").textContent = new Date().getFullYear();

function showStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`.trim();
  statusBox.hidden = false;
}

function validateInstagramUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Cole um link válido do Instagram.");
  }
  const hosts = ["instagram.com", "www.instagram.com", "m.instagram.com"];
  if (parsed.protocol !== "https:" || !hosts.includes(parsed.hostname.toLowerCase())) {
    throw new Error("Use um link HTTPS de instagram.com.");
  }
  if (!/^\/(reel|reels|p|tv)\/[a-zA-Z0-9_-]+\/?$/.test(parsed.pathname)) {
    throw new Error("Esse link não parece ser de um Reel ou publicação compatível.");
  }
  return parsed.href;
}

pasteButton.addEventListener("click", async () => {
  try {
    const value = await navigator.clipboard.readText();
    if (!value) return showStatus("A área de transferência está vazia.", "error");
    input.value = value.trim();
    input.focus();
    statusBox.hidden = true;
  } catch {
    showStatus("Não foi possível acessar a área de transferência. Cole o link usando Ctrl + V.", "error");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  resultBox.hidden = true;
  previewBox.replaceChildren();
  downloadArea.replaceChildren();
  statusBox.hidden = true;

  let url;
  try {
    url = validateInstagramUrl(input.value.trim());
  } catch (error) {
    showStatus(error.message, "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector(".btn-label").textContent = "Consultando...";
  try {
    const response = await fetch("/api/consultar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.erro || "Não foi possível consultar esse link.");

    resultBox.hidden = false;
    const iframe = document.createElement("iframe");
    iframe.src = data.embed;
    iframe.title = "Prévia da publicação do Instagram";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    previewBox.append(iframe);

    if (data.downloadDisponivel && data.downloadUrl) {
      const link = document.createElement("a");
      link.className = "download-link";
      link.href = data.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "↓ Abrir arquivo MP4";
      downloadArea.append(link);
      const note = document.createElement("p");
      note.className = "download-note";
      note.textContent = "O arquivo é fornecido pelo serviço integrado. Confirme se você tem autorização para baixá-lo.";
      downloadArea.append(note);
      showStatus("Publicação consultada. O provedor disponibilizou um arquivo.", "success");
    } else {
      showStatus(data.mensagem || "Link reconhecido. A prévia depende das permissões do Instagram. O download MP4 ainda não está configurado.", "success");
    }
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    showStatus(error.message || "Ocorreu um erro ao consultar a publicação.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector(".btn-label").textContent = "Consultar vídeo";
  }
});
