// AVISAQUI-GAMES-001 — biblioteca independente, sem dependências do núcleo.
const ID_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARQUIVO_VALIDO = /^\.\/[a-z0-9-]+\.js$/;

export function validarCatalogo(dados) {
  if (!dados || dados.schemaVersion !== 1 || !Array.isArray(dados.games)) throw new Error('Catálogo incompatível');
  const ids = new Set();
  return dados.games.map(jogo => {
    if (!jogo || typeof jogo.id !== 'string' || !ID_VALIDO.test(jogo.id) ||
        typeof jogo.title !== 'string' || !jogo.title.trim() ||
        (jogo.status === 'construction' ? jogo.module !== undefined : (typeof jogo.module !== 'string' || !ARQUIVO_VALIDO.test(jogo.module))) ||
        ids.has(jogo.id)) throw new Error('Entrada de jogo inválida');
    ids.add(jogo.id);
    return Object.freeze({ ...jogo });
  });
}

export async function obterCatalogo({ fetcher = fetch, url = new URL('./manifest.json', import.meta.url) } = {}) {
  const resposta = await fetcher(url, { cache: 'no-cache', credentials: 'omit' });
  if (!resposta.ok) throw new Error('Catálogo indisponível');
  const dados = await resposta.json();
  return validarCatalogo(dados);
}

export function criarSessaoJogos({ importar = caminho => import(caminho) } = {}) {
  let geracao = 0;
  let destruirAtual = null;
  return {
    async abrir(jogo, container, opcoes = {}) {
      const atual = ++geracao;
      if (destruirAtual) { destruirAtual(); destruirAtual = null; }
      if (!jogo || !ARQUIVO_VALIDO.test(jogo.module)) throw new Error('Jogo inválido');
      const endereco = new URL(jogo.module, import.meta.url);
      endereco.searchParams.set('v','49');
      const caminho = endereco.href;
      const modulo = await importar(caminho);
      if (atual !== geracao) return false;
      if (typeof modulo.iniciarJogoDaVelha !== 'function' && typeof modulo.iniciarJogo !== 'function') throw new Error('Módulo incompatível');
      const iniciar = modulo.iniciarJogo || modulo.iniciarJogoDaVelha;
      const encerrar = iniciar({ ...opcoes, container });
      if (typeof encerrar !== 'function') throw new Error('Jogo sem encerramento');
      if (atual !== geracao) { encerrar(); return false; }
      destruirAtual = encerrar;
      return true;
    },
    encerrar() {
      geracao++;
      if (destruirAtual) { const destruir = destruirAtual; destruirAtual = null; destruir(); }
    }
  };
}
