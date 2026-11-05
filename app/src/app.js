"use strict";

const etapas = [
  { nome: "Commit", descricao: "push na branch main dispara o GitHub Actions" },
  { nome: "SonarCloud", descricao: "bugs, vulnerabilidades e code smells" },
  { nome: "Trivy (código)", descricao: "dependências, segredos e configurações" },
  { nome: "Build", descricao: "imagem Docker do frontend" },
  { nome: "Trivy (imagem)", descricao: "vulnerabilidades da imagem gerada" },
  { nome: "Docker Hub", descricao: "push da imagem versionada pelo SHA do commit" },
  { nome: "kind", descricao: "deploy no cluster Kubernetes" }
];

const integrantes = ["Hian Rick", "Patricia Morais", "Katleen Martins"];

function renderEtapas() {
  const lista = document.getElementById("etapas");
  etapas.forEach((etapa) => {
    const li = document.createElement("li");
    const nome = document.createElement("strong");
    nome.textContent = etapa.nome;
    li.appendChild(nome);
    li.appendChild(document.createTextNode(" — " + etapa.descricao));
    lista.appendChild(li);
  });
}

function renderIntegrantes() {
  const lista = document.getElementById("integrantes");
  integrantes.forEach((nome) => {
    const li = document.createElement("li");
    li.textContent = nome;
    lista.appendChild(li);
  });
}

renderEtapas();
renderIntegrantes();
