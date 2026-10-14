// WhatsApp comercial: código do país + DDD + número.
const WHATSAPP = "5585997674228";

const servicos = [
  {
    nome: "Landing Pages",
    icone: "🚀",
    descricao:
      "Páginas estratégicas para apresentar ofertas, divulgar serviços e gerar contatos."
  },
  {
    nome: "Sites Empresariais",
    icone: "💻",
    descricao:
      "Apresente sua empresa com um site profissional, moderno e adaptado para celulares."
  },
  {
    nome: "Lojas Virtuais",
    icone: "🛍️",
    descricao:
      "Tenha sua loja online e apresente seus produtos para clientes pela internet."
  },
  {
    nome: "Manutenção de Sites",
    icone: "⚙️",
    descricao:
      "Conte com ajuda para atualizações, correções e melhorias no seu site."
  }
];

const lista = document.getElementById("lista-servicos");

servicos.forEach((servico) => {
  const card = document.createElement("article");
  card.className = "service-card";

  const icone = document.createElement("div");
  icone.className = "service-icon";
  icone.setAttribute("aria-hidden", "true");
  icone.textContent = servico.icone;

  const titulo = document.createElement("h3");
  titulo.textContent = servico.nome;

  const descricao = document.createElement("p");
  descricao.textContent = servico.descricao;

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn";
  botao.textContent = "Solicitar orçamento ↗";

  botao.addEventListener("click", () => {
    document.getElementById("tipo").value =
      servico.nome === "Landing Pages" ? "Landing page" :
      servico.nome === "Sites Empresariais" ? "Site empresarial" :
      servico.nome === "Lojas Virtuais" ? "Loja virtual" :
      "Manutenção de site";

    document.getElementById("orcamento").scrollIntoView({
      behavior: "smooth"
    });

    document.getElementById("nome").focus({
      preventScroll: true
    });
  });

  card.append(icone, titulo, descricao, botao);
  lista.appendChild(card);
});

document.getElementById("form-orcamento")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const empresa = document.getElementById("empresa").value.trim();
    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value.trim();
    const prazo = document.getElementById("prazo").value;
    const investimento =
      document.getElementById("orcamento-valor").value;

    if (!nome || !tipo || !descricao) {
      alert("Preencha seu nome, o serviço e a descrição do projeto.");
      return;
    }

    const mensagem = [
      "Olá, Nexo Digital! Gostaria de solicitar um orçamento.",
      "",
      "*Nome:* " + nome,
      empresa ? "*Empresa:* " + empresa : "",
      "*Serviço:* " + tipo,
      "*Descrição do projeto:* " + descricao,
      prazo ? "*Prazo desejado:* " + prazo : "",
      investimento ? "*Investimento previsto:* " + investimento : "",
      "",
      "Aguardo o retorno. Obrigado!"
    ].filter(Boolean).join("\n");

    const url =
      "https://wa.me/" + WHATSAPP +
      "?text=" + encodeURIComponent(mensagem);

    window.open(url, "_blank", "noopener,noreferrer");
  });

document.getElementById("ano").textContent =
  new Date().getFullYear();
