/* ===== EDITE AQUI =====
   nome, cat (ambiente), de (preço antigo), por (preço atual), parcela, nota (0 a 5),
   av (nº de avaliações), tag (ex.: "Mais vendido", ou vazio), emoji, cor (fundo), link. */
var PRODUTOS = [
  {nome:"Vaso decorativo de cerâmica",cat:"Sala",de:129.90,por:69.90,parcela:"3x de R$ 23,30 sem juros",nota:4.8,av:1420,tag:"Mais vendido",emoji:"🏺",cor:"#f0dcc4",link:"#"},
  {nome:"Kit 3 quadros decorativos com moldura",cat:"Sala",de:219.90,por:119.90,parcela:"4x de R$ 30,00 sem juros",nota:4.6,av:980,tag:"",emoji:"🖼️",cor:"#dde6d8",link:"#"},
  {nome:"Luminária de mesa LED",cat:"Quarto",de:159.90,por:89.90,parcela:"3x de R$ 30,00 sem juros",nota:4.7,av:2210,tag:"Menor preço",emoji:"💡",cor:"#f6e7b8",link:"#"},
  {nome:"Espelho redondo com moldura",cat:"Quarto",de:249.90,por:139.90,parcela:"5x de R$ 28,00 sem juros",nota:4.5,av:760,tag:"",emoji:"🪞",cor:"#e4dcef",link:"#"},
  {nome:"Kit 3 vasos para plantas",cat:"Jardim",de:99.90,por:54.90,parcela:"2x de R$ 27,45 sem juros",nota:4.7,av:1890,tag:"Mais vendido",emoji:"🪴",cor:"#d5e8d2",link:"#"},
  {nome:"Jogo de 4 velas aromáticas",cat:"Cozinha",de:89.90,por:49.90,parcela:"2x de R$ 24,95 sem juros",nota:4.9,av:3050,tag:"",emoji:"🕯️",cor:"#f8d9cf",link:"#"}
];
/* ===== FIM DA EDIÇÃO ===== */

function brl(v){return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
var cats=["Todos"];PRODUTOS.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
var atual="Todos",grid=document.getElementById("grid"),bar=document.getElementById("bar");
function render(){
  grid.innerHTML="";
  PRODUTOS.forEach(function(p){
    if(atual!=="Todos"&&p.cat!==atual)return;
    var pct=Math.round((1-p.por/p.de)*100);
    var el=document.createElement("article");el.className="card";
    el.innerHTML='<div class="pic" style="background:'+p.cor+'">'+(p.tag?'<span class="tag"></span>':'')+'<span class="off">-'+pct+'%</span><span aria-hidden="true">'+p.emoji+'</span></div>'+
    '<div class="body"><span class="cat"></span><h3></h3><div class="rate"><b>★</b> '+p.nota.toFixed(1).replace(".",",")+' ('+p.av.toLocaleString("pt-BR")+' avaliações)</div>'+
    '<div class="price"><span class="old">de '+brl(p.de)+'</span><div class="new">'+brl(p.por)+'</div><span class="parc"></span></div>'+
    '<a class="buy" target="_blank" rel="noopener sponsored">Ver oferta</a></div>';
    if(p.tag)el.querySelector(".tag").textContent=p.tag;
    el.querySelector(".cat").textContent=p.cat;
    el.querySelector("h3").textContent=p.nome;
    el.querySelector(".parc").textContent=p.parcela||"";
    el.querySelector(".buy").href=p.link;
    grid.appendChild(el);
  });
}
cats.forEach(function(c){
  var b=document.createElement("button");b.textContent=c;b.setAttribute("aria-pressed",c===atual);
  b.onclick=function(){atual=c;[].forEach.call(bar.children,function(x){x.setAttribute("aria-pressed",x===b)});render()};
  bar.appendChild(b);
});
render();
