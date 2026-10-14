const API_URL = `${API_BASE_URL}/livros`;

const formulario = document.querySelector("#form-livro");
const campoId = document.querySelector("#livro-id");
const campoTitulo = document.querySelector("#titulo");
const campoAutor = document.querySelector("#autor");
const campoAno = document.querySelector("#ano");
const campoLido = document.querySelector("#lido");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaLivros = document.querySelector("#lista-livros");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function criarCartaoLivro(livro) {
  const cartao = document.createElement("article");
  cartao.className = "usuario";

  const titulo = document.createElement("h3");
  titulo.textContent = livro.titulo;

  const autor = document.createElement("p");
  autor.textContent = `Autor: ${livro.autor}`;

  const ano = document.createElement("p");
  ano.textContent = `Ano: ${livro.ano ?? "Não informado"}`;

  const status = document.createElement("span");
  status.className = livro.lido ? "selo lido" : "selo";
  status.textContent = livro.lido ? "Lido" : "Quero ler";

  const id = document.createElement("p");
  id.textContent = `ID: ${livro._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-usuario";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarLivroParaEdicao(livro._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirLivro(livro._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(titulo, autor, ano, status, id, acoes);
  return cartao;
}

function exibirLivros(livros) {
  listaLivros.innerHTML = "";

  if (livros.length === 0) {
    mostrarMensagem("Nenhum livro cadastrado");
    return;
  }

  livros.forEach((livro) => listaLivros.appendChild(criarCartaoLivro(livro)));
  mostrarMensagem(`${livros.length} livro(s) encontrado(s)`);
}

async function listarLivros() {
  try {
    mostrarMensagem("Carregando livros... (a primeira vez pode demorar se a API estiver 'dormindo')");
    const livros = await fazerRequisicao(API_URL);
    exibirLivros(livros);
  } catch (erro) {
    listaLivros.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function salvarLivro(evento) {
  evento.preventDefault();

  const livro = {
    titulo: campoTitulo.value.trim(),
    autor: campoAutor.value.trim(),
    lido: campoLido.checked
  };

  if (campoAno.value !== "") livro.ano = Number(campoAno.value);

  const id = campoId.value;
  const estaEditando = Boolean(id);

  try {
    await fazerRequisicao(estaEditando ? `${API_URL}/${id}` : API_URL, {
      method: estaEditando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livro)
    });

    limparFormulario();
    await listarLivros();
    mostrarMensagem(estaEditando ? "Livro atualizado" : "Livro cadastrado");
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarLivroParaEdicao(id) {
  try {
    const livro = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = livro._id;
    campoTitulo.value = livro.titulo;
    campoAutor.value = livro.autor;
    campoAno.value = livro.ano ?? "";
    campoLido.checked = Boolean(livro.lido);
    tituloFormulario.textContent = "Editar livro";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoTitulo.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirLivro(id) {
  if (!window.confirm("Deseja excluir este livro?")) return;

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    await listarLivros();
    mostrarMensagem("Livro excluído");
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Novo livro";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarLivro);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarLivros);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarLivros();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    const livro = await fazerRequisicao(`${API_URL}/${id}`);
    exibirLivros([livro]);
  } catch (erro) {
    listaLivros.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarLivros();
