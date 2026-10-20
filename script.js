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
  { disciplina: "Educação Digital