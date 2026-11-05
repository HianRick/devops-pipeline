"use strict";

const TAXA_ENTREGA = 6.9;

const pratos = [
  { id: 1, nome: "X-Burguer", categoria: "Lanches", preco: 24.9, emoji: "🍔", descricao: "Pão brioche, blend 150g, queijo e salada." },
  { id: 2, nome: "Pizza Margherita", categoria: "Pizzas", preco: 49.9, emoji: "🍕", descricao: "Molho de tomate, muçarela e manjericão." },
  { id: 3, nome: "Pizza Calabresa", categoria: "Pizzas", preco: 46.9, emoji: "🍕", descricao: "Calabresa fatiada, cebola e azeitonas." },
  { id: 4, nome: "Combo Sushi", categoria: "Japonesa", preco: 59.9, emoji: "🍣", descricao: "20 peças variadas de salmão e kani." },
  { id: 5, nome: "Hot Dog", categoria: "Lanches", preco: 16.9, emoji: "🌭", descricao: "Salsicha, purê, batata palha e molhos." },
  { id: 6, nome: "Batata Frita", categoria: "Acompanhamentos", preco: 14.9, emoji: "🍟", descricao: "Porção média, crocante e sequinha." },
  { id: 7, nome: "Refrigerante", categoria: "Bebidas", preco: 6.5, emoji: "🥤", descricao: "Lata 350ml, vários sabores." },
  { id: 8, nome: "Açaí 500ml", categoria: "Sobremesas", preco: 19.9, emoji: "🍨", descricao: "Com granola, banana e leite condensado." }
];

const integrantes = ["Hian Rick", "Patricia Morais", "Katleen Martins"];

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// id do prato -> quantidade
const carrinho = new Map();
let categoriaAtiva = "Todos";

function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) {
    el.className = classe;
  }
  if (texto !== undefined) {
    el.textContent = texto;
  }
  return el;
}

function renderFiltros() {
  const container = document.getElementById("filtros");
  const categorias = ["Todos", ...new Set(pratos.map((p) => p.categoria))];
  container.replaceChildren();

  categorias.forEach((categoria) => {
    const botao = criar("button", "filtro", categoria);
    botao.type = "button";
    if (categoria === categoriaAtiva) {
      botao.classList.add("ativo");
    }
    botao.addEventListener("click", () => {
      categoriaAtiva = categoria;
      renderFiltros();
      renderCardapio();
    });
    container.appendChild(botao);
  });
}

function renderCardapio() {
  const container = document.getElementById("cardapio");
  container.replaceChildren();

  pratos
    .filter((p) => categoriaAtiva === "Todos" || p.categoria === categoriaAtiva)
    .forEach((prato) => {
      const cartao = criar("article", "prato");
      cartao.appendChild(criar("div", "prato-emoji", prato.emoji));
      cartao.appendChild(criar("h3", "", prato.nome));
      cartao.appendChild(criar("p", "", prato.descricao));

      const rodape = criar("div", "prato-rodape");
      rodape.appendChild(criar("span", "preco", moeda.format(prato.preco)));

      const botao = criar("button", "botao", "Adicionar");
      botao.type = "button";
      botao.addEventListener("click", () => alterarQuantidade(prato.id, 1));
      rodape.appendChild(botao);

      cartao.appendChild(rodape);
      container.appendChild(cartao);
    });
}

function alterarQuantidade(id, delta) {
  const atual = carrinho.get(id) || 0;
  const nova = atual + delta;
  if (nova <= 0) {
    carrinho.delete(id);
  } else {
    carrinho.set(id, nova);
  }
  document.getElementById("mensagem").textContent = "";
  renderCarrinho();
}

function renderCarrinho() {
  const lista = document.getElementById("itens-carrinho");
  lista.replaceChildren();

  let subtotal = 0;
  let quantidadeTotal = 0;

  carrinho.forEach((quantidade, id) => {
    const prato = pratos.find((p) => p.id === id);
    subtotal += prato.preco * quantidade;
    quantidadeTotal += quantidade;

    const item = criar("li", "item-carrinho");
    item.appendChild(criar("span", "", prato.emoji + " " + prato.nome));

    const controles = criar("span", "quantidade");
    const menos = criar("button", "botao botao-pequeno", "−");
    menos.type = "button";
    menos.setAttribute("aria-label", "Remover um " + prato.nome);
    menos.addEventListener("click", () => alterarQuantidade(id, -1));

    const mais = criar("button", "botao botao-pequeno", "+");
    mais.type = "button";
    mais.setAttribute("aria-label", "Adicionar um " + prato.nome);
    mais.addEventListener("click", () => alterarQuantidade(id, 1));

    controles.appendChild(menos);
    controles.appendChild(criar("span", "", String(quantidade)));
    controles.appendChild(mais);
    item.appendChild(controles);

    lista.appendChild(item);
  });

  const vazio = quantidadeTotal === 0;
  const taxa = vazio ? 0 : TAXA_ENTREGA;

  document.getElementById("carrinho-vazio").hidden = !vazio;
  document.getElementById("contador").textContent = String(quantidadeTotal);
  document.getElementById("taxa").textContent = moeda.format(taxa);
  document.getElementById("total").textContent = moeda.format(subtotal + taxa);
  document.getElementById("finalizar").disabled = vazio;
}

function finalizarPedido() {
  const numero = Date.now().toString().slice(-5);
  carrinho.clear();
  renderCarrinho();
  document.getElementById("mensagem").textContent =
    "Pedido #" + numero + " confirmado! Chega em até 40 minutos. 🛵";
}

document.getElementById("finalizar").addEventListener("click", finalizarPedido);
document.getElementById("integrantes").textContent = integrantes.join(", ");

renderFiltros();
renderCardapio();
renderCarrinho();
