// ============================================================
// BOLETIM DIGITAL — 9º ANO
// Dados fictícios + funções para montar cards e tabela
// ============================================================

// ------------------------------------------------------------
// 1) DADOS BRUTOS (array de objetos)
// Cada objeto é uma disciplina com notas e faltas dos 3 trimestres.
// As notas podem vir como número (78) ou texto ("8,2"), de propósito,
// para testarmos a função normalizarNota().
// ------------------------------------------------------------
const disciplinas = [
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

// Média mínima de referência
const MEDIA_MINIMA = 6.0;

// Frequência GERAL fictícia (apenas para demonstração nesta etapa).
// Em versões futuras, esse valor será tratado de outra forma.
const FREQUENCIA_DEMONSTRATIVA = 92;

// ------------------------------------------------------------
// 2) FUNÇÃO: normalizarNota(valor)
// Converte o valor bruto para a escala 0–10.
// Regras:
//   - vazio / null / undefined → null (nota ainda não lançada)
//   - 0 a 10 → mantém
//   - >10 e <=100 → divide por 10
//   - aceita ponto ou vírgula decimal
//   - fora das regras → null (inválida)
// ------------------------------------------------------------
function normalizarNota(valor) {
  // Se for vazio, null ou undefined, não há nota
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for texto, troca vírgula por ponto
  let numero;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  } else {
    numero = valor;
  }

  // Se não for número válido, retorna null
  if (isNaN(numero)) return null;

  // Regra 1: entre 0 e 10, mantém
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Regra 2: maior que 10 e até 100, divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras: inválido
  return null;
}

// ------------------------------------------------------------
// 3) FUNÇÃO: calcularMedia(notas)
// Recebe um array de notas (já normalizadas ou null) e
// calcula a média usando apenas as notas disponíveis.
// Uma nota ausente NÃO vira zero.
// ------------------------------------------------------------
function calcularMedia(notas) {
  let soma = 0;
  let quantidade = 0;

  notas.forEach(function (nota) {
    if (nota !== null) {
      soma += nota;
      quantidade++;
    }
  });

  // Se não houver nenhuma nota válida, retorna null
  if (quantidade === 0) return null;

  return soma / quantidade;
}

// ------------------------------------------------------------
// 4) FUNÇÃO: definirSituacao(media)
// Retorna o texto da situação de acordo com a média.
// ------------------------------------------------------------
function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

// ------------------------------------------------------------
// 5) FUNÇÃO: formatarNota(nota)
// Mostra a nota com uma casa decimal ou "—" se for null.
// ------------------------------------------------------------
function formatarNota(nota) {
  if (nota === null) return "—";
  return nota.toFixed(1).replace(".", ",");
}

// ------------------------------------------------------------
// 6) FUNÇÃO: classeSituacao(situacao)
// Retorna a classe CSS correspondente à situação.
// ------------------------------------------------------------
function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

// ------------------------------------------------------------
// 7) PROCESSAR DADOS
// Aqui pegamos os dados brutos e geramos um novo array
// com notas já normalizadas, média, total de faltas e situação.
// ------------------------------------------------------------
const dadosProcessados = disciplinas.map(function (item) {
  // Normaliza cada uma das três notas
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  // Calcula a média usando apenas as notas disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // Soma as faltas dos três trimestres
  const totalFaltas = item.faltas[0] + item.faltas[1] + item.faltas[2];

  // Define a situação
  const situacao = definirSituacao(media);

  return {
    disciplina: item.disciplina,
    tri1: n1,
    tri2: n2,
    tri3: n3,
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  };
});

// ------------------------------------------------------------
// 8) MONTAR A TABELA (DOM)
// Pegamos o <tbody id="corpo-tabela"> e criamos uma linha
// para cada disciplina processada.
// ------------------------------------------------------------
function montarTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = ""; // limpa antes de montar

  dadosProcessados.forEach(function (d) {
    const linha = document.createElement("tr");

    linha.innerHTML =
      "<td>" + d.disciplina + "</td>" +
      "<td>" + formatarNota(d.tri1) + "</td>" +
      "<td>" + formatarNota(d.tri2) + "</td>" +
      "<td>" + formatarNota(d.tri3) + "</td>" +
      "<td><strong>" + formatarNota(d.media) + "</strong></td>" +
      "<td>" + d.faltas + "</td>" +
      "<td class='" + classeSituacao(d.situacao) + "'>" + d.situacao + "</td>";

    corpo.appendChild(linha);
  });
}

// ------------------------------------------------------------
// 9) MONTAR OS CARDS DE RESUMO (DOM)
// Calcula média geral, total de faltas, bons desempenhos,
// disciplinas em atenção e mostra a frequência demonstrativa.
// ------------------------------------------------------------
function montarCards() {
  const container = document.getElementById("cards");

  // Média geral: considera apenas as disciplinas com média disponível
  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let bons = 0;
  let atencao = 0;

  dadosProcessados.forEach(function (d) {
    if (d.media !== null) {
      somaMedias += d.media;
      qtdMedias++;
    }
    totalFaltas += d.faltas;
    if (d.situacao === "Bom desempenho") bons++;
    if (d.situacao === "Atenção") atencao++;
  });

  const mediaGeral = qtdMedias > 0 ? (somaMedias / qtdMedias) : null;

  // Lista de cards: ícone + título + valor
  const listaCards = [
    { icone: "📊", titulo: "Média geral", valor: mediaGeral === null ? "—" : formatarNota(mediaGeral) },
    { icone: "📝", titulo: "Total de faltas", valor: totalFaltas },
    { icone: "✅", titulo: "Bom desempenho", valor: bons + " disciplinas" },
    { icone: "⚠️", titulo: "Precisam de atenção", valor: atencao + " disciplinas" },
    { icone: "📅", titulo: "Frequência", valor: FREQUENCIA_DEMONSTRATIVA + "% — Frequência adequada" }
  ];

  container.innerHTML = "";

  listaCards.forEach(function (c) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      "<div class='icone'>" + c.icone + "</div>" +
      "<div>" +
        "<div class='titulo-card'>" + c.titulo + "</div>" +
        "<div class='valor-card'>" + c.valor + "</div>" +
      "</div>";
    container.appendChild(card);
  });
}

// ------------------------------------------------------------
// 10) INICIAR
// Quando a página terminar de carregar, monta cards e tabela.
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  montarCards();
  montarTabela();
});