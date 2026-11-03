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
  { disciplina: "Educação Digital", tri1: 85, tri2: "8,8", tri3: 9.1, faltas: [0, 0, 0] },
  { disciplina: "Educação Financeira", tri1: null, tri2: null, tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Rec Aprend Matemática", tri1: null, tri2: null, tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Rec Aprend Língua Portuguesa", tri1: null, tri2: null, tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Pensamento Lógico", tri1: null, tri2: null, tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: null, tri2: null, tri3: null, faltas: [0, 0, 0] },
  { disciplina: "Práticas Experimentais", tri1: null, tri2: null, tri3: null, faltas: [0, 0, 0] }
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
        <td>${totalFaltas}</td>
        <td>${status}</td>
      `;
    }

    corpoTabela.appendChild(tr);
  });
}

function preencherCards() {
  const containerCards = document.getElementById("cards");
  if (!containerCards) return;

  const lista = (dadosAtuais && dadosAtuais.disciplinas) ? dadosAtuais.disciplinas : disciplinasPadrao;

  let somaMedias = 0;
  let countMedias = 0;
  let totalFaltasGeral = 0;

  lista.forEach(d => {
    const m = calcularMediaDisciplina(d);
    if (m !== null) {
      somaMedias += m;
      countMedias++;
    }
    totalFaltasGeral += calcularTotalFaltasDisciplina(d);
  });

  const mediaGeral = countMedias > 0 ? (somaMedias / countMedias).toFixed(1).replace(".", ",") : "-";

  containerCards.innerHTML = `
    <div class="card">
      <h3>MÉDIA GERAL</h3>
      <p>${mediaGeral}</p>
    </div>
    <div class="card">
      <h3>TOTAL DISCIPLINAS</h3>
      <p>${lista.length}</p>
    </div>
    <div class="card">
      <h3>TOTAL DE FALTAS</h3>
      <p>${totalFaltasGeral}</p>
    </div>
  `;
}

function atualizarTela() {
  preencherCards();
  preencherTabela();
  atualizarGraficos();
}

// ------------------------------------------------------------
// 5) CAMADA EXCLUSIVA DOS GRÁFICOS (SOMENTE LEITURA)
// ------------------------------------------------------------
function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  const lista = (dadosAtuais && dadosAtuais.disciplinas) ? dadosAtuais.disciplinas : disciplinasPadrao;
  
  const labels = lista.map(d => d.disciplina);
  const data = lista.map(d => {
    const m = calcularMediaDisciplina(d);
    return m !== null ? parseFloat(m.toFixed(1)) : null;
  });

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Média",
        data: data,
        backgroundColor: "#00ff66",
        borderColor: "#00ff66",
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(0, 255, 102, 0.1)" }
        },
        y: {
          ticks: { color: "#ffffff", font: { size: 9 } },
          grid: { color: "rgba(0, 255, 102, 0.1)" }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              return val === null ? "Sem nota" : `Média: ${val.toFixed(1).replace(".", ",")}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  const lista = (dadosAtuais && dadosAtuais.disciplinas) ? dadosAtuais.disciplinas : disciplinasPadrao;

  function calcularMediaTrimestre(campoTri) {
    let soma = 0;
    let count = 0;
    lista.forEach(d => {
      const n = normalizarNota(d[campoTri]);
      if (n !== null) {
        soma += n;
        count++;
      }
    });
    return count > 0 ? parseFloat((soma / count).toFixed(1)) : null;
  }

  const mediaTri1 = calcularMediaTrimestre("tri1");
  const mediaTri2 = calcularMediaTrimestre("tri2");
  const mediaTri3 = calcularMediaTrimestre("tri3");

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: [mediaTri1, mediaTri2, mediaTri3],
        borderColor: "#ffe600",
        backgroundColor: "rgba(255, 230, 0, 0.2)",
        borderWidth: 3,
        fill: true,
        tension: 0.2,
        pointRadius: 5,
        pointBackgroundColor: "#ffe600"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(0, 255, 102, 0.1)" }
        },
        x: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(0, 255, 102, 0.1)" }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              return val === null ? "Sem notas" : `Média Geral: ${val.toFixed(1).replace(".", ",")}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  const containerEstado = document.getElementById("estadoFaltas");
  const cardFaltas = document.getElementById("cardFaltas");
  if (!canvas) return;

  const lista = (dadosAtuais && dadosAtuais.disciplinas) ? dadosAtuais.disciplinas : disciplinasPadrao;

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  lista.forEach(d => {
    if (Array.isArray(d.faltas)) {
      faltasTri1 += parseInt(d.faltas[0]) || 0;
      faltasTri2 += parseInt(d.faltas[1]) || 0;
      faltasTri3 += parseInt(d.faltas[2]) || 0;
    }
  });

  const totalFaltasAcc = faltasTri1 + faltasTri2 + faltasTri3;
  const estaCritico = totalFaltasAcc >= 350;

  if (containerEstado) {
    containerEstado.innerHTML = estaCritico ? `<span class="badge-perigo">PERIGO</span>` : "";
  }
  if (cardFaltas) {
    if (estaCritico) {
      cardFaltas.classList.add("card-perigo");
    } else {
      cardFaltas.classList.remove("card-perigo");
    }
  }

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [faltasTri1, faltasTri2, faltasTri3],
        backgroundColor: ["#ff0055", "#ff0055", "#ff0055"],
        borderColor: "#ffffff",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#ffffff", precision: 0 },
          grid: { color: "rgba(0, 255, 102, 0.1)" }
        },
        x: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(0, 255, 102, 0.1)" }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} faltas`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// ------------------------------------------------------------
// 6) NÚCLEO DE EDICÃO, VALIDAÇÃO E SALVAMENTO (IMUTÁVEL)
// ------------------------------------------------------------
function habilitarEdicao() {
  modoEdicao = true;
  document.getElementById("btn-alterar").style.display = "none";
  document.getElementById("btn-salvar").style.display = "inline-block";
  preencherTabela();
}

function desabilitarEdicao() {
  modoEdicao = false;
  document.getElementById("btn-alterar").style.display = "inline-block";
  document.getElementById("btn-salvar").style.display = "none";
  atualizarTela();
}

function validarCampos() {
  const inputs = document.querySelectorAll("#corpo-tabela input");
  let valido = true;

  inputs.forEach(input => {
    const campo = input.dataset.campo;
    const val = input.value.trim();

    if (campo.startsWith("tri")) {
      if (val !== "") {
        const n = normalizarNota(val);
        if (n === null || n < 0 || n > 10) {
          input.style.borderColor = "#ff0055";
          valido = false;
        } else {
          input.style.borderColor = "#00ff66";
        }
      } else {
        input.style.borderColor = "#00ff66";
      }
    } else if (campo.startsWith("f")) {
      const fNum = parseInt(val);
      if (isNaN(fNum) || fNum < 0) {
        input.style.borderColor = "#ff0055";
        valido = false;
      } else {
        input.style.borderColor = "#00ff66";
      }
    }
  });

  return valido;
}

function lerDadosFormulario() {
  const listaOriginal = (dadosAtuais && dadosAtuais.disciplinas) ? dadosAtuais.disciplinas : disciplinasPadrao;
  const disciplinasNovas = JSON.parse(JSON.stringify(listaOriginal));

  const inputs = document.querySelectorAll("#corpo-tabela input");

  inputs.forEach(input => {
    const idx = parseInt(input.dataset.idx);
    const campo = input.dataset.campo;
    const val = input.value.trim();

    if (!disciplinasNovas[idx]) return;

    if (campo === "tri1") disciplinasNovas[idx].tri1 = val === "" ? null : val;
    if (campo === "tri2") disciplinasNovas[idx].tri2 = val === "" ? null : val;
    if (campo === "tri3") disciplinasNovas[idx].tri3 = val === "" ? null : val;

    if (campo === "f1") disciplinasNovas[idx].faltas[0] = parseInt(val) || 0;
    if (campo === "f2") disciplinasNovas[idx].faltas[1] = parseInt(val) || 0;
    if (campo === "f3") disciplinasNovas[idx].faltas[2] = parseInt(val) || 0;
  });

  return disciplinasNovas;
}

async function salvarAlteracoes() {
  const msgSalvar = document.getElementById("msg-salvar");
  msgSalvar.textContent = "";

  if (!validarCampos()) {
    msgSalvar.style.color = "#ff0055";
    msgSalvar.textContent = "VERIFIQUE OS VALORES DIGITADOS!";
    return;
  }

  const disciplinasAtualizadas = lerDadosFormulario();

  const payload = {
    turma: CONFIG_ALUNO.turma,
    numeroChamada: CONFIG_ALUNO.numeroChamada,
    disciplinas: disciplinasAtualizadas
  };

  msgSalvar.style.color = "#ffe600";
  msgSalvar.textContent = "SAVING...";

  try {
    const resp = await fetch(`${CONFIG_ALUNO.apiUrl}/boletim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PIN": pinSessao
      },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      msgSalvar.style.color = "#00ff66";
      msgSalvar.textContent = "SAVED SUCCESSFULLY!";
      dadosAtuais = payload;
      desabilitarEdicao();
    } else {
      msgSalvar.style.color = "#ff0055";
      msgSalvar.textContent = "ERRO AO SALVAR NA API.";
    }
  } catch (err) {
    dadosAtuais = payload;
    msgSalvar.style.color = "#ffe600";
    msgSalvar.textContent = "SALVO LOCALMENTE (OFFLINE)";
    desabilitarEdicao();
  }
}

// ------------------------------------------------------------
// 7) CARREGAMENTO E AUTENTICAÇÃO API/LOGIN (IMUTÁVEL + FALLBACK REGULAR)
// ------------------------------------------------------------
async function carregarDadosAPI() {
  try {
    const url = `${CONFIG_ALUNO.apiUrl}/boletim?turma=${CONFIG_ALUNO.turma}&numeroChamada=${CONFIG_ALUNO.numeroChamada}`;
    const resp = await fetch(url, {
      headers: { "X-PIN": pinSessao }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.disciplinas) {
        dadosAtuais = data;
      } else {
        dadosAtuais = { disciplinas: disciplinasPadrao };
      }
    } else {
      dadosAtuais = { disciplinas: disciplinasPadrao };
    }
  } catch (e) {
    dadosAtuais = { disciplinas: disciplinasPadrao };
  }
  atualizarTela();
}

async function fazerLogin() {
  const pinInput = document.getElementById("campo-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = pinInput ? pinInput.value.trim() : "";

  if (!pinDigitado) {
    if (msgLogin) {
      msgLogin.style.color = "#ff0055";
      msgLogin.textContent = "DIGITE O PIN!";
    }
    return;
  }

  pinSessao = pinDigitado;

  const areaAcesso = document.getElementById("area-acesso");
  const painelBoletim = document.getElementById("painel-boletim");

  if (areaAcesso) areaAcesso.style.display = "none";
  if (painelBoletim) painelBoletim.style.display = "block";

  await carregarDadosAPI();
}