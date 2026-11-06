/*
 * =====================================================================
 *  ARQUIVO DE DEMONSTRAÇÃO — NÃO É USADO PELO SITE
 * =====================================================================
 *  Versão do app/src/app.js com:
 *    1. Uma MUDANÇA VISÍVEL no site (promoção com entrega grátis + 2 pratos novos);
 *    2. PROBLEMAS DE PROPÓSITO (bugs, vulnerabilidades, code smells e um secret falso),
 *       todos dentro do bloco marcado "INÍCIO DOS PROBLEMAS" no fim do arquivo.
 *
 *  Roteiro:
 *    git checkout -b demo-apresentacao
 *    copy apresentacao\codigo-com-erros.js app\src\app.js      (PowerShell: Copy-Item ... -Force)
 *    git add app/src/app.js
 *    git commit -m "Promoção: entrega grátis"
 *    git push -u origin demo-apresentacao
 *    -> Abrir PR para a main. Esperado:
 *         - SonarCloud: Quality Gate FAILED (bugs, vulnerabilidades, code smells)
 *         - Trivy fs:   secret "github-pat" encontrado -> job falha
 *         - Build/push/deploy: não rodam (dependem dos gates)
 *
 *    Correção ao vivo: em app/src/app.js, apagar TODO o bloco entre
 *    "INÍCIO DOS PROBLEMAS" e "FIM DOS PROBLEMAS", depois:
 *    git commit -am "Corrige problemas apontados pelo Sonar e pelo Trivy"
 *    git push
 *    -> Checks verdes -> Merge -> deploy -> http://localhost:8080 mostra a promoção.
 *
 *  Esta pasta (apresentacao/) fica fora do Sonar (sonar.sources=app/src)
 *  e fora do Trivy (skip-dirs), então este arquivo não quebra a main.
 * =====================================================================
 */

"use strict";

// MUDANÇA VISÍVEL: entrega grátis (antes era 6.9)
const TAXA_ENTREGA = 0;

const pratos = [
  { id: 1, nome: "X-Burguer", categoria: "Lanches", preco: 24.9, emoji: "🍔", descricao: "Pão brioche, blend 150g, queijo e salada." },
  { id: 2, nome: "Pizza Margherita", categoria: "Pizzas", preco: 49.9, emoji: "🍕", descricao: "Molho de tomate, muçarela e manjericão." },
  { id: 3, nome: "Pizza Calabresa", categoria: "Pizzas", preco: 46.9, emoji: "🍕", descricao: "Calabresa fatiada, cebola e azeitonas." },
  { id: 4, nome: "Combo Sushi", categoria: "Japonesa", preco: 59.9, emoji: "🍣", descricao: "20 peças variadas de salmão e kani." },
  { id: 5, nome: "Hot Dog", categoria: "Lanches", preco: 16.9, emoji: "🌭", descricao: "Salsicha, purê, batata palha e molhos." },
  { id: 6, nome: "Batata Frita", categoria: "Acompanhamentos", preco: 14.9, emoji: "🍟", descricao: "Porção média, crocante e sequinha." },
  { id: 7, nome: "Refrigerante", categoria: "Bebidas", preco: 6.5, emoji: "🥤", descricao: "Lata 350ml, vários sabores." },
  { id: 8, nome: "Açaí 500ml", categoria: "Sobremesas", preco: 19.9, emoji: "🍨", descricao: "Com granola, banana e leite condensado." },
  // MUDANÇA VISÍVEL: pratos novos
  { id: 9, nome: "Taco Mexicano", categoria: "Mexicana", preco: 22.9, emoji: "🌮", descricao: "Tortilla, carne temperada, guacamole e pico de gallo." },
  { id: 10, nome: "Donut", categoria: "Sobremesas", preco: 9.9, emoji: "🍩", descricao: "Cobertura de chocolate com granulado." }
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
  document.getElementById("taxa").textContent = taxa === 0 && !vazio ? "Grátis" : moeda.format(taxa);
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

// MUDANÇA VISÍVEL: banner de promoção
document.querySelector(".destaque h1").textContent = "🔥 Hoje a entrega é GRÁTIS!";
document.querySelector(".destaque p").textContent = "Promoção válida para todos os pedidos. Aproveite!";

document.getElementById("finalizar").addEventListener("click", finalizarPedido);
document.getElementById("integrantes").textContent = integrantes.join(", ");

renderFiltros();
renderCardapio();
renderCarrinho();

// =====================================================================
// INÍCIO DOS PROBLEMAS (apagar este bloco inteiro na correção ao vivo)
// =====================================================================

// [TRIVY - SECRET] Token falso no formato de Personal Access Token do GitHub.
const GITHUB_TOKEN = "ghp_aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5";

// [SONAR - VULNERABILIDADE] Senha "hardcoded" no código.
const SENHA_ADMIN = "admin123";

// [SONAR - VULNERABILIDADE] eval com entrada externa (injeção de código).
function aplicarCupom(total, cupom) {
  return eval(total + " * " + cupom);
}

// [SONAR - VULNERABILIDADE] XSS: texto da URL inserido com innerHTML.
function mostrarBusca() {
  const termo = new URLSearchParams(location.search).get("q");
  document.getElementById("mensagem").innerHTML = "Você buscou: " + termo;
}

// [SONAR - BUG] Atribuição no lugar de comparação; comparação com NaN.
function calcularFrete(distancia) {
  if (distancia = 0) {
    return 0;
  }
  if (distancia === NaN) {
    return -1;
  }
  return distancia * 1.5;
}

// [SONAR - BUG] Os dois ramos do if fazem a mesma coisa.
function statusPedido(pago) {
  if (pago) {
    return "Em preparo";
  } else {
    return "Em preparo";
  }
}

// [SONAR - CODE SMELL] var, variável não usada, ifs aninhados demais, catch vazio.
function validarPedido(pedido) {
  var naoUsada = 42;
  try {
    if (pedido) {
      if (pedido.itens) {
        if (pedido.itens.length > 0) {
          if (pedido.endereco) {
            if (pedido.endereco.cep) {
              return true;
            }
          }
        }
      }
    }
  } catch (e) {
  }
  return false;
}

// [SONAR - CODE SMELL] Código duplicado (cópia de validarPedido).
function validarPedidoNovamente(pedido) {
  var naoUsada = 42;
  try {
    if (pedido) {
      if (pedido.itens) {
        if (pedido.itens.length > 0) {
          if (pedido.endereco) {
            if (pedido.endereco.cep) {
              return true;
            }
          }
        }
      }
    }
  } catch (e) {
  }
  return false;
}

// =====================================================================
// FIM DOS PROBLEMAS
// =====================================================================
