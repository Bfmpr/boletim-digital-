// ============================================================
// BOLETIM DIGITAL — 9º ANO (RETRO ARCADE EDITION)
// Configuração, dados locais, API e manipuladores de interface
// ============================================================

// ------------------------------------------------------------
// 1) CONFIGURAÇÃO FIXA DO ALUNO
// ------------------------------------------------------------
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 7,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variável para manter o PIN somente em memória durante a sessão
let pinSessao = "";

// ------------------------------------------------------------
// 2) DADOS LOCALMENTE ARMAZENADOS (FALLBACK/PADRÃO)
// ------------------------------------------------------------
const disciplinasPadrao = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 85, tri2: "8,8", tri3: 9.1, faltas: [0, 0, 0] }
];

// Estado atual dos dados em memória
let dadosAtuais = null;
let modoEdicao = false;

// Instâncias globais dos gráficos (isoladas)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// ------------------------------------------------------------
// 3) NÚCLEO DE UTILS & CÁLCULOS EXISTENTES (IMUTÁVEL)
// ------------------------------------------------------------
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }
  const num = parseFloat(valor);
  if (isNaN(num)) return null;
  return num > 10 ? num / 10 : num;
}

function calcularMediaDisciplina(d) {
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  const notasValidas = [];
  if (n1 !== null) notasValidas.push(n1);
  if (n2 !== null) notasValidas.push(n2);
  if (n3 !== null) notasValidas.push(n3);

  if (notasValidas.length === 0) return null;
  const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
  return soma / notasValidas.length;
}

function calcularTotalFaltasDisciplina(d) {
  if (!Array.isArray(d.faltas)) return 0;
  return d.faltas.reduce((acc, f) => acc + (parseInt(f) || 0), 0);
}

function formatarNotaExibicao(valor) {
  const n = normalizarNota(valor);
  return n === null ? "-" : n.toFixed(1).replace(".", ",");
}

// ------------------------------------------------------------
// 4) INTERFACE E RENDERIZAÇÃO DE TABELA E CARDS (EXISTENTE)
// ------------------------------------------------------------
function preencherTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  if (!corpoTabela) return;
  corpoTabela.innerHTML = "";

  const lista = (dadosAtuais && dadosAtuais.disciplinas) ? dadosAtuais.disciplinas : disciplinasPadrao;

  lista.forEach((d, index) => {
    const tr = document.createElement("tr");

    const mediaVal = calcularMediaDisciplina(d);
    const mediaFormatada = mediaVal === null ? "-" : mediaVal.toFixed(1).replace(".", ",");
    const totalFaltas = calcularTotalFaltasDisciplina(d);
    
    let status = "EM ANDAMENTO";
    if (mediaVal !== null) {
      status = mediaVal >= 6.0 ? "APROVADO" : "ATENÇÃO";
    }

    if (modoEdicao) {
      const f1 = Array.isArray(d.faltas) ? (d.faltas[0] ?? 0) : 0;
      const f2 = Array.isArray(d.faltas) ? (d.faltas[1] ?? 0) : 0;
      const f3 = Array.isArray(d.faltas) ? (d.faltas[2] ?? 0) : 0;

      tr.innerHTML = `
        <td><strong>${d.disciplina}</strong></td>
        <td><input type="text" data-idx="${index}" data-campo="tri1" value="${d.tri1 ?? ""}" /></td>
        <td><input type="text" data-idx="${index}" data-campo="tri2" value="${d.tri2 ?? ""}" /></td>
        <td><input type="text" data-idx="${index}" data-campo="tri3" value="${d.tri3 ?? ""}" /></td>
        <td>${mediaFormatada}</td>
        <td>
          <input type="number" style="width: 35px;" data-idx="${index}" data-campo="f1" value="${f1}" min="0" />
          <input type="number" style="width: 35px;" data-idx="${index}" data-campo="f2" value="${f2}" min="0" />
          <input type="number" style="width: 35px;" data-idx="${index}" data-campo="f3" value="${f3}" min="0" />
        </td>
        <td>${status}</td>
      `;
    } else {
      tr.innerHTML = `
        <td><strong>${d.disciplina}</strong></td>
        <td>${formatarNotaExibicao(d.tri1)}</td>
        <td>${formatarNotaExibicao(d.tri2)}</td>
        <td>${formatarNotaExibicao(d.tri3)}</td>
        <td>${mediaFormatada}</td>