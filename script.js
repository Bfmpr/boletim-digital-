// ============================================================
// BOLETIM DIGITAL — 9º ANO
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
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Dados atualmente ativos na aplicação
let dadosAtuais = [];
let emModoEdicao = false;

// Média mínima de referência e frequência fictícia
const MEDIA_MINIMA = 6.0;
const FREQUENCIA_DEMONSTRATIVA = 92;

// ------------------------------------------------------------
// 3) FUNÇÕES DE NORMALIZAÇÃO E FORMATAÇÃO (DADOS ANTIGOS/LOCAL)
// ------------------------------------------------------------
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  } else {
    numero = valor;
  }

  if (isNaN(numero)) return null;

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

function calcularMedia(notas) {
  let soma = 0;
  let quantidade = 0;

  notas.forEach(function (nota) {
    if (nota !== null && nota !== undefined) {
      soma += nota;
      quantidade++;
    }
  });

  if (quantidade === 0) return null;
  return soma / quantidade;
}

function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

function formatarNota(nota) {
  if (nota === null || nota === undefined) return "—";
  return Number(nota).toFixed(1).replace(".", ",");
}

function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

// ------------------------------------------------------------
// 4) CARREGAR / RENDERIZAR BOLETIM
// ------------------------------------------------------------
function processarEExibirDados(dadosDisciplinas) {
  dadosAtuais = dadosDisciplinas.map(function (item) {
    let n1, n2, n3, faltasTri;

    // Se vem da API ou do modelo editado
    if (Array.isArray(item.faltas)) {
      faltasTri = [item.faltas[0] || 0, item.faltas[1] || 0, item.faltas[2] || 0];
    } else {
      faltasTri = [item.faltas_tri1 || 0, item.faltas_tri2 || 0, item.faltas_tri3 || 0];
    }

    n1 = normalizarNota(item.tri1 !== undefined ? item.tri1 : item.nota_tri1);
    n2 = normalizarNota(item.tri2 !== undefined ? item.tri2 : item.nota_tri2);
    n3 = normalizarNota(item.tri3 !== undefined ? item.tri3 : item.nota_tri3);

    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = faltasTri[0] + faltasTri[1] + faltasTri[2];
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      faltasTri: faltasTri,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });

  montarCards();
  montarTabela();
}

// ------------------------------------------------------------
// 5) MONTAR TABELA DO BOLETIM (DOM SEGURO)
// ------------------------------------------------------------
function montarTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = "";

  dadosAtuais.forEach(function (d, index) {
    const linha = document.createElement("tr");

    // Coluna Disciplina
    const tdDisc = document.createElement("td");
    tdDisc.textContent = d.disciplina;
    linha.appendChild(tdDisc);

    if (emModoEdicao) {
      // Inputs de Notas
      ['tri1', 'tri2', 'tri3'].forEach(function (triKey) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-edicao";
        input.dataset.index = index;
        input.dataset.campo = triKey;
        input.value = d[triKey] !== null ? d[triKey].toString().replace(".", ",") : "";
        td.appendChild(input);
        linha.appendChild(td);
      });

      // Coluna Média (calculada)
      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = formatarNota(d.media);
      tdMedia.appendChild(strongMedia);
      linha.appendChild(tdMedia);

      // Inputs de Faltas
      const tdFaltas = document.createElement("td");
      const divFaltas = document.createElement("div");
      divFaltas.style.display = "flex";
      divFaltas.style.gap = "4px";

      [0, 1, 2].forEach(function (triIdx) {
        const inputFalta = document.createElement("input");
        inputFalta.type = "text";
        inputFalta.className = "input-edicao";
        inputFalta.style.width = "35px";
        inputFalta.dataset.index = index;
        inputFalta.dataset.campo = "falta_" + triIdx;
        inputFalta.value = d.faltasTri[triIdx];
        divFaltas.appendChild(inputFalta);
      });

      tdFaltas.appendChild(divFaltas);
      linha.appendChild(tdFaltas);

    } else {
      // Exibição Padrão
      const tdT1 = document.createElement("td");
      tdT1.textContent = formatarNota(d.tri1);
      linha.appendChild(tdT1);

      const tdT2 = document.createElement("td");
      tdT2.textContent = formatarNota(d.tri2);
      linha.appendChild(tdT2);

      const tdT3 = document.createElement("td");
      tdT3.textContent = formatarNota(d.tri3);
      linha.appendChild(tdT3);

      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = formatarNota(d.media);
      tdMedia.appendChild(strongMedia);
      linha.appendChild(tdMedia);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = d.faltas;
      linha.appendChild(tdFaltas);
    }

    // Coluna Situação
    const tdSit = document.createElement("td");
    tdSit.className = classeSituacao(d.situacao);
    tdSit.textContent = d.situacao;
    linha.appendChild(tdSit);

    corpo.appendChild(linha);
  });
}

// ------------------------------------------------------------
// 6) MONTAR CARDS DE RESUMO (DOM SEGURO)
// ------------------------------------------------------------
function montarCards() {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let bons = 0;
  let atencao = 0;

  dadosAtuais.forEach(function (d) {
    if (d.media !== null) {
      somaMedias += d.media;
      qtdMedias++;
    }
    totalFaltas += d.faltas;
    if (d.situacao === "Bom desempenho") bons++;
    if (d.situacao === "Atenção") atencao++;
  });

  const mediaGeral = qtdMedias > 0 ? (somaMedias / qtdMedias) : null;

  const listaCards = [
    { icone: "📊", titulo: "Média geral", valor: mediaGeral === null ? "—" : formatarNota(mediaGeral) },
    { icone: "📝", titulo: "Total de faltas", valor: totalFaltas },
    { icone: "✅", titulo: "Bom desempenho", valor: bons + " disciplinas" },
    { icone: "⚠️", titulo: "Precisam de atenção", valor: atencao + " disciplinas" },
    { icone: "📅", titulo: "Frequência", valor: FREQUENCIA_DEMONSTRATIVA + "% — Frequência adequada" }
  ];

  listaCards.forEach(function (c) {
    const card = document.createElement("div");
    card.className = "card";

    const divIcone = document.createElement("div");
    divIcone.className = "icone";
    divIcone.textContent = c.icone;

    const divDetalhes = document.createElement("div");
    const divTitulo = document.createElement("div");
    divTitulo.className = "titulo-card";
    divTitulo.textContent = c.titulo;

    const divValor = document.createElement("div");
    divValor.className = "valor-card";
    divValor.textContent = c.valor;

    divDetalhes.appendChild(divTitulo);
    divDetalhes.appendChild(divValor);

    card.appendChild(divIcone);
    card.appendChild(divDetalhes);

    container.appendChild(card);
  });
}

// ------------------------------------------------------------
// 7) AUTENTICAÇÃO COM O PIN
// ------------------------------------------------------------
async function fazerLogin() {
  const campoPin = document.getElementById("campo-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite o PIN.";
    msgLogin.className = "mensagem-status erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status info";

  try {
    const response = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (response.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    if (response.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    if (!response.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    const resultado = await response.json();

    // PIN válido: armazena em memória e limpa a tela de login
    pinSessao = pinDigitado;
    campoPin.value = "";

    document.getElementById("area-acesso").style.display = "none";
    document.getElementById("painel-boletim").style.display = "block";

    if (resultado && resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      processarEExibirDados(resultado.dados.disciplinas);
    } else {
      processarEExibirDados(disciplinasPadrao);
    }

  } catch (err) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status erro";
  }
}

// ------------------------------------------------------------
// 8) MODO DE EDIÇÃO
// ------------------------------------------------------------
function habilitarEdicao() {
  emModoEdicao = true;
  document.getElementById("btn-alterar").style.display = "none";
  document.getElementById("btn-salvar").style.display = "inline-block";
  document.getElementById("msg-salvar").textContent = "";
  montarTabela();
}

// ------------------------------------------------------------
// 9) SALVAR ALTERAÇÕES NA API
// ------------------------------------------------------------
async function salvarAlteracoes() {
  const inputs = document.querySelectorAll(".input-edicao");
  let temErro = false;

  // Reseta estados de validação visual
  inputs.forEach(input => input.classList.remove("invalido"));

  const novosDados = JSON.parse(JSON.stringify(dadosAtuais));

  // Validação dos campos editados
  inputs.forEach(input => {
    const index = parseInt(input.dataset.index, 10);
    const campo = input.dataset.campo;
    const valor = input.value.trim();

    if (campo.startsWith("falta_")) {
      const triIdx = parseInt(campo.split("_")[1], 10);
      if (!/^\d+$/.test(valor)) {
        input.classList.add("invalido");
        temErro = true;
      } else {
        novosDados[index].faltasTri[triIdx] = parseInt(valor, 10);
      }
    } else {
      if (valor === "") {
        novosDados[index][campo] = null;
      } else {
        const valTratado = valor.replace(",", ".");
        if (!/^\d+(\.\d+)?$/.test(valTratado)) {
          input.classList.add("invalido");
          temErro = true;
        } else {
          const num = parseFloat(valTratado);
          if (num >= 0 && num <= 10) {
            novosDados[index][campo] = num;
          } else {
            input.classList.add("invalido");
            temErro = true;
          }
        }
      }
    }
  });

  const msgSalvar = document.getElementById("msg-salvar");

  if (temErro) {
    msgSalvar.textContent = "Verifique os campos destacados em vermelho.";
    msgSalvar.className = "mensagem-status erro";
    return;
  }

  msgSalvar.textContent = "Salvando...";
  msgSalvar.className = "mensagem-status info";

  // Prepara payload de envio para a API
  const disciplinasParaSalvar = novosDados.map(d => ({
    disciplina: d.disciplina,
    tri1: d.tri1,
    tri2: d.tri2,
    tri3: d.tri3,
    faltas: d.faltasTri
  }));

  try {
    const response = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: disciplinasParaSalvar
        }
      })
    });

    if (!response.ok) {
      msgSalvar.textContent = "Erro ao salvar alterações na API. Tente novamente.";
      msgSalvar.className = "mensagem-status erro";
      return;
    }

    // Sucesso ao salvar
    emModoEdicao = false;
    document.getElementById("btn-alterar").style.display = "inline-block";
    document.getElementById("btn-salvar").style.display = "none";
    msgSalvar.textContent = "Dados salvos com sucesso.";
    msgSalvar.className = "mensagem-status sucesso";

    processarEExibirDados(disciplinasParaSalvar);

  } catch (err) {
    msgSalvar.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgSalvar.className = "mensagem-status erro";
  }
}