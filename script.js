
/* ==========================================
   CASA COM ESTILO
   CADASTRO DOS PRODUTOS
   ==========================================

   Para cadastrar produtos, edite a lista abaixo.

   link: coloque seu link de afiliado verdadeiro.
   imagem: caminho da foto dentro da pasta images.
*/

var PRODUTOS = [
  {
    nome: "Vaso decorativo de cerâmica",
    cat: "Sala",
    de: 129.90,
    por: 69.90,
    parcela: "3x de R$ 23,30 sem juros",
    nota: 4.8,
    av: 1420,
    tag: "Mais vendido",
    emoji: "🏺",
    cor: "#f0dcc4",
    imagem: "",
    link: "#"
  },
  {
    nome: "Kit 3 quadros decorativos com moldura",
    cat: "Sala",
    de: 219.90,
    por: 119.90,
    parcela: "4x de R$ 30,00 sem juros",
    nota: 4.6,
    av: 980,
    tag: "Destaque",
    emoji: "🖼️",
    cor: "#dde6d8",
    imagem: "",
    link: "#"
  },
  {
    nome: "Luminária de mesa LED",
    cat: "Quarto",
    de: 159.90,
    por: 89.90,
    parcela: "3x de R$ 30,00 sem juros",
    nota: 4.7,
    av: 2210,
    tag: "Menor preço",
    emoji: "💡",
    cor: "#f6e7b8",
    imagem: "",
    link: "#"
  },
  {
    nome: "Espelho redondo com moldura",
    cat: "Quarto",
    de: 249.90,
    por: 139.90,
    parcela: "5x de R$ 28,00 sem juros",
    nota: 4.5,
    av: 760,
    tag: "",
    emoji: "🪞",
    cor: "#e4dcef",
    imagem: "",
    link: "#"
  },
  {
    nome: "Kit 3 vasos para plantas",
    cat: "Jardim",
    de: 99.90,
    por: 54.90,
    parcela: "2x de R$ 27,45 sem juros",
    nota: 4.7,
    av: 1890,
    tag: "Mais vendido",
    emoji: "🪴",
    cor: "#d5e8d2",
    imagem: "",
    link: "#"
  },
  {
    nome: "Jogo de 4 velas aromáticas",
    cat: "Cozinha",
    de: 89.90,
    por: 49.90,
    parcela: "2x de R$ 24,95 sem juros",
    nota: 4.9,
    av: 3050,
    tag: "",
    emoji: "🕯️",
    cor: "#f8d9cf",
    imagem: "",
    link: "#"
  }
];

/* ==========================================
   FUNCIONAMENTO DA LOJA
   ========================================== */

(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var bar = document.getElementById("bar");
  var search = document.getElementById("search");
  var sort = document.getElementById("sort");
  var empty = document.getElementById("empty");
  var count = document.getElementById("result-count");

  var atual = "Todos";
  var pesquisa = "";

  function brl(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function desconto(produto) {
    if (!produto.de || produto.de <= produto.por) return 0;

    return Math.round(
      (1 - produto.por / produto.de) * 100
    );
  }

  function criarCategorias() {
    var categorias = ["Todos"];

    PRODUTOS.forEach(function (produto) {
      if (!categorias.includes(produto.cat)) {
        categorias.push(produto.cat);
      }
    });

    bar.innerHTML = "";

    categorias.forEach(function (categoria) {
      var botao = document.createElement("button");

      botao.type = "button";
      botao.textContent = categoria;
      botao.setAttribute(
        "aria-pressed",
        categoria === atual ? "true" : "false"
      );

      botao.addEventListener("click", function () {
        atual = categoria;

        criarCategorias();
        renderizar();
      });

      bar.appendChild(botao);
    });
  }

  function criarCard(produto) {
    var card = document.createElement("article");
    card.className = "card";

    var foto = document.createElement("div");
    foto.className = "pic";
    foto.style.backgroundColor = produto.cor || "#eee5d7";

    if (produto.imagem) {
      var img = document.createElement("img");

      img.src = produto.imagem;
      img.alt = produto.nome;
      img.loading = "lazy";

      img.onerror = function () {
        img.remove();
        foto.textContent = produto.emoji || "🏡";
      };

      foto.appendChild(img);
    } else {
      foto.textContent = produto.emoji || "🏡";
    }

    if (produto.tag) {
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = produto.tag;
      foto.appendChild(tag);
    }

    var porcentagem = desconto(produto);

    if (porcentagem > 0) {
      var off = document.createElement("span");
      off.className = "off";
      off.textContent = "-" + porcentagem + "%";
      foto.appendChild(off);
    }

    var corpo = document.createElement("div");
    corpo.className = "body";

    var categoria = document.createElement("span");
    categoria.className = "cat";
    categoria.textContent = produto.cat;

    var nome = document.createElement("h3");
    nome.textContent = produto.nome;

    corpo.appendChild(categoria);
    corpo.appendChild(nome);

    if (Number.isFinite(Number(produto.nota)) &&
        Number.isFinite(Number(produto.av))) {
      var avaliacao = document.createElement("div");
      avaliacao.className = "rate";

      var estrela = document.createElement("b");
      estrela.textContent = "★";

      avaliacao.appendChild(estrela);
      avaliacao.appendChild(
        document.createTextNode(
          " " +
          Number(produto.nota).toFixed(1).replace(".", ",") +
          " (" +
          Number(produto.av).toLocaleString("pt-BR") +
          " avaliações)"
        )
      );

      corpo.appendChild(avaliacao);
    }

    var preco = document.createElement("div");
    preco.className = "price";

    if (produto.de && produto.de > produto.por) {
      var antigo = document.createElement("span");
      antigo.className = "old";
      antigo.textContent = "De " + brl(produto.de);
      preco.appendChild(antigo);
    }

    var novo = document.createElement("div");
    novo.className = "new";
    novo.textContent = brl(produto.por);

    preco.appendChild(novo);

    if (produto.parcela) {
      var parcela = document.createElement("span");
      parcela.className = "parc";
      parcela.textContent = produto.parcela;
      preco.appendChild(parcela);
    }

    corpo.appendChild(preco);

    var comprar = document.createElement("a");
    comprar.className = "buy";

    var linkValido =
      typeof produto.link === "string" &&
      /^https?:\/\//i.test(produto.link);

    if (linkValido) {
      comprar.href = produto.link;
      comprar.target = "_blank";
      comprar.rel = "noopener noreferrer sponsored";
      comprar.textContent = "Ver oferta →";
      comprar.setAttribute(
        "aria-label",
        "Ver oferta de " + produto.nome
      );
    } else {
      comprar.href = "#produtos";
      comprar.textContent = "Link de compra em configuração";
      comprar.setAttribute("aria-disabled", "true");
      comprar.style.opacity = "0.65";

      comprar.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }

    corpo.appendChild(comprar);

    card.appendChild(foto);
    card.appendChild(corpo);

    return card;
  }

  function renderizar() {
    grid.innerHTML = "";

    var lista = PRODUTOS.filter(function (produto) {
      var categoriaCorreta =
        atual === "Todos" || produto.cat === atual;

      var texto =
        (produto.nome + " " + produto.cat).toLowerCase();

      var pesquisaCorreta =
        texto.includes(pesquisa.toLowerCase());

      return categoriaCorreta && pesquisaCorreta;
    });

    if (sort.value === "low") {
      lista.sort(function (a, b) {
        return a.por - b.por;
      });
    }

    if (sort.value === "high") {
      lista.sort(function (a, b) {
        return b.por - a.por;
      });
    }

    if (sort.value === "discount") {
      lista.sort(function (a, b) {
        return desconto(b) - desconto(a);
      });
    }

    lista.forEach(function (produto) {
      grid.appendChild(criarCard(produto));
    });

    count.textContent =
      lista.length +
      (lista.length === 1
        ? " produto encontrado"
        : " produtos encontrados");

    empty.hidden = lista.length !== 0;
    grid.hidden = lista.length === 0;
  }

  /* PESQUISA */

  search.addEventListener("input", function () {
    pesquisa = search.value.trim();
    renderizar();
  });

  /* ORDENAÇÃO */

  sort.addEventListener("change", renderizar);

  /* CATEGORIAS DA PÁGINA INICIAL */

  document.querySelectorAll(".category-tile").forEach(
    function (tile) {
      tile.addEventListener("click", function () {
        atual = tile.dataset.category;

        search.value = "";
        pesquisa = "";

        criarCategorias();
        renderizar();
      });
    }
  );

  /* ANO AUTOMÁTICO */

  document.getElementById("year").textContent =
    new Date().getFullYear();

  /* INICIALIZAÇÃO */

  criarCategorias();
  renderizar();

})();
