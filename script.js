
/* ==========================================
   CASA COM ESTILO
   PRODUTOS E LINKS DE AFILIADOS
   MERCADO LIVRE
   ========================================== */

var PRODUTOS = [
  {
    nome: "Toalha de Mesa Rústica Retangular 6 Lugares",
    cat: "Sala",
    de: null,
    por: null,
    parcela: "",
    nota: null,
    av: null,
    tag: "Decoração",
    emoji: "🤎",
    cor: "#e9dcc9",
    imagem: "",
    plataforma: "Mercado Livre",
    link: "https://meli.la/2KSSdL2"
  },
  {
    nome: "Kit Decoração de Natal com Cortinas, Toalha e Balões",
    cat: "Natal",
    de: null,
    por: null,
    parcela: "",
    nota: null,
    av: null,
    tag: "Especial de Natal",
    emoji: "🎄",
    cor: "#e8d8cf",
    imagem: "",
    plataforma: "Mercado Livre",
    link: "https://meli.la/21895Ec"
  },
  {
    nome: "Balcão de Cozinha Veneza Multimóveis Branco 190 cm",
    cat: "Cozinha",
    de: null,
    por: null,
    parcela: "",
    nota: null,
    av: null,
    tag: "Para sua cozinha",
    emoji: "🍽️",
    cor: "#e7e5dc",
    imagem: "",
    plataforma: "Mercado Livre",
    link: "https://meli.la/1baPsov"
  },
  {
    nome: "Cordão de Luzes Natalinas 100 LED Branco Quente 9,5 m",
    cat: "Natal",
    de: null,
    por: null,
    parcela: "",
    nota: null,
    av: null,
    tag: "Ilumine seu Natal",
    emoji: "✨",
    cor: "#f5e9c9",
    imagem: "",
    plataforma: "Mercado Livre",
    link: "https://meli.la/2AibyF9"
  },
  {
    nome: "Conjunto 4 Capas de Almofadas Natal Off White 45x45",
    cat: "Natal",
    de: null,
    por: null,
    parcela: "",
    nota: null,
    av: null,
    tag: "Decoração natalina",
    emoji: "🎁",
    cor: "#eee8df",
    imagem: "",
    plataforma: "Mercado Livre",
    link: "https://meli.la/1Ubn5HH"
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
    if (
      !Number.isFinite(Number(produto.de)) ||
      !Number.isFinite(Number(produto.por)) ||
      produto.de <= produto.por ||
      produto.por <= 0
    ) {
      return 0;
    }

    return Math.round(
      (1 - produto.por / produto.de) * 100
    );
  }

  /* CATEGORIAS */

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

  /* CARTÃO DO PRODUTO */

  function criarCard(produto) {
    var card = document.createElement("article");
    card.className = "card";

    /* FOTO */

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

        var emoji = document.createElement("span");
        emoji.textContent = produto.emoji || "🏡";
        foto.appendChild(emoji);
      };

      foto.appendChild(img);
    } else {
      foto.textContent = produto.emoji || "🏡";
    }

    /* ETIQUETA */

    if (produto.tag) {
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = produto.tag;
      foto.appendChild(tag);
    }

    /* DESCONTO */

    var porcentagem = desconto(produto);

    if (porcentagem > 0) {
      var off = document.createElement("span");
      off.className = "off";
      off.textContent = "-" + porcentagem + "%";
      foto.appendChild(off);
    }

    /* INFORMAÇÕES */

    var corpo = document.createElement("div");
    corpo.className = "body";

    var categoria = document.createElement("span");
    categoria.className = "cat";
    categoria.textContent = produto.cat;

    var nome = document.createElement("h3");
    nome.textContent = produto.nome;

    corpo.appendChild(categoria);
    corpo.appendChild(nome);

    /* AVALIAÇÕES: SÓ MOSTRA SE FOREM INFORMADAS */

    if (
      Number.isFinite(Number(produto.nota)) &&
      produto.nota !== null &&
      produto.av !== null &&
      Number.isFinite(Number(produto.av))
    ) {
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

    /* PREÇOS */

    var preco = document.createElement("div");
    preco.className = "price";

    var temPreco =
      Number.isFinite(Number(produto.por)) &&
      produto.por !== null &&
      Number(produto.por) > 0;

    if (temPreco) {
      if (
        Number.isFinite(Number(produto.de)) &&
        produto.de !== null &&
        produto.de > produto.por
      ) {
        var antigo = document.createElement("span");
        antigo.className = "old";
        antigo.textContent = "De " + brl(produto.de);
        preco.appendChild(antigo);
      }

      var novo = document.createElement("div");
      novo.className = "new";
      novo.textContent = brl(produto.por);
      preco.appendChild(novo);
    } else {
      var consultar = document.createElement("div");
      consultar.className = "new";
      consultar.style.fontSize = "17px";
      consultar.textContent = "Consultar preço";
      preco.appendChild(consultar);
    }

    if (produto.parcela) {
      var parcela = document.createElement("span");
      parcela.className = "parc";
      parcela.textContent = produto.parcela;
      preco.appendChild(parcela);
    }

    corpo.appendChild(preco);

    /* PLATAFORMA */

    if (produto.plataforma) {
      var plataforma = document.createElement("small");
      plataforma.style.display = "block";
      plataforma.style.marginTop = "8px";
      plataforma.style.color = "#82796e";
      plataforma.textContent = "Oferta em " + produto.plataforma;
      corpo.appendChild(plataforma);
    }

    /* BOTÃO DE COMPRA */

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
      comprar.textContent = "Oferta indisponível";
      comprar.setAttribute("aria-disabled", "true");

      comprar.addEventListener("click", function (event) {
        event.preventDefault();
      });
    }

    corpo.appendChild(comprar);

    card.appendChild(foto);
    card.appendChild(corpo);

    return card;
  }

  /* PESQUISA, FILTROS E ORDENAÇÃO */

  function renderizar() {
    grid.innerHTML = "";

    var lista = PRODUTOS.filter(function (produto) {
      var categoriaCorreta =
        atual === "Todos" || produto.cat === atual;

      var texto =
        (produto.nome + " " + produto.cat + " " +
        (produto.plataforma || "")).toLowerCase();

      var pesquisaCorreta =
        texto.includes(pesquisa.toLowerCase());

      return categoriaCorreta && pesquisaCorreta;
    });

    if (sort.value === "low") {
      lista.sort(function (a, b) {
        return (a.por || Infinity) - (b.por || Infinity);
      });
    }

    if (sort.value === "high") {
      lista.sort(function (a, b) {
        return (b.por || 0) - (a.por || 0);
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

  /* CAMPO DE PESQUISA */

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
