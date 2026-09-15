console.log("CLIENTES JS CARREGADO");

let clientes = [];


// =========================================================
// CARREGAR CLIENTES
// =========================================================

async function carregarClientes() {

    try {

        const resposta = await fetch("/api/clientes", {
            credentials: "same-origin"
        });

        if (resposta.status === 401) {
            window.location.href = "login.html";
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro ao carregar clientes");
        }

        clientes = await resposta.json();

        renderizarClientes(clientes);

    } catch (erro) {

        console.error("Erro ao carregar clientes:", erro);

        const lista = document.getElementById("listaClientes");

        if (lista) {

            lista.innerHTML = `
                <div class="mensagem-vazia">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Erro ao carregar os clientes.
                    </p>

                </div>
            `;

        }

    }

}


// =========================================================
// RENDERIZAR CLIENTES
// =========================================================

function renderizarClientes(listaClientes) {

    const lista = document.getElementById("listaClientes");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    if (!listaClientes || listaClientes.length === 0) {

        lista.innerHTML = `
            <div class="mensagem-vazia">

                <i class="fa-solid fa-users"></i>

                <p>
                    Nenhum cliente encontrado.
                </p>

            </div>
        `;

        return;
    }


    listaClientes.forEach(cliente => {

        const card = document.createElement("div");

        card.className = "cliente-card";


        const status = calcularStatus(cliente);


        card.innerHTML = `

            <div class="cliente-resumo">

                <div class="cliente-info-principal">

                    <h3>
                        ${escaparHTML(cliente.name || "Cliente")}
                    </h3>

                    <span class="badge ${status.classe}">
                        ${status.texto}
                    </span>

                </div>

                <i class="icone-expandir fa-solid fa-chevron-down"></i>

            </div>


            <div class="cliente-detalhes">

                <div class="detalhes-grid">

                    <div class="detalhe">
                        <span>WhatsApp</span>
                        <strong>
                            ${escaparHTML(cliente.numero || "-")}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Usuário</span>
                        <strong>
                            ${escaparHTML(cliente.usuario || "-")}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Aplicativo</span>
                        <strong>
                            ${escaparHTML(cliente.aplicativo || "-")}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Plano</span>
                        <strong>
                            ${escaparHTML(cliente.plano || "-")}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Valor</span>
                        <strong>
                            R$ ${formatarValor(cliente.valor)}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Telas</span>
                        <strong>
                            ${cliente.telas || 1}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Cadastro</span>
                        <strong>
                            ${formatarData(cliente.dataInicio)}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Pagamento</span>
                        <strong>
                            ${formatarData(
                                cliente.dataPagamento ||
                                cliente.data_pagamento
                            )}
                        </strong>
                    </div>

                    <div class="detalhe">
                        <span>Vencimento</span>
                        <strong>
                            ${formatarData(
                                cliente.dataExpiracao ||
                                cliente.data_expiracao
                            )}
                        </strong>
                    </div>

                </div>


                ${
                    cliente.descricao
                    ?
                    `
                        <div class="cliente-descricao">

                            <span>Descrição</span>

                            <p>
                                ${escaparHTML(cliente.descricao)}
                            </p>

                        </div>
                    `
                    :
                    ""
                }


                <div class="acoes">

                    <button
                        type="button"
                        class="btn-editar"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Editar
                    </button>


                    <button
                        type="button"
                        class="btn-renovar"
                    >
                        <i class="fa-solid fa-rotate"></i>
                        Renovar
                    </button>


                    <button
                        type="button"
                        class="btn-whatsapp"
                    >
                        <i class="fa-brands fa-whatsapp"></i>
                        Whatsapp
                    </button>


                    <button
                        type="button"
                        class="btn-excluir"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;


        lista.appendChild(card);


        // =====================================================
        // EXPANDIR CARD
        // =====================================================

        const resumo =
            card.querySelector(".cliente-resumo");

        const detalhes =
            card.querySelector(".cliente-detalhes");

        const icone =
            card.querySelector(".icone-expandir");


        resumo.addEventListener("click", () => {

            const aberto =
                detalhes.classList.contains("aberto");


            detalhes.classList.toggle("aberto");


            if (icone) {

                icone.className =
                    aberto
                    ?
                    "icone-expandir fa-solid fa-chevron-down"
                    :
                    "icone-expandir fa-solid fa-chevron-up";

            }

        });


        // =====================================================
        // EDITAR
        // =====================================================

        card
            .querySelector(".btn-editar")
            .addEventListener("click", event => {

                event.stopPropagation();

                editarCliente(cliente.id);

            });


        // =====================================================
        // RENOVAR
        // =====================================================

        card
            .querySelector(".btn-renovar")
            .addEventListener("click", event => {

                event.stopPropagation();

                renovarCliente(cliente.id);

            });


        // =====================================================
        // WHATSAPP
        // =====================================================

        card
            .querySelector(".btn-whatsapp")
            .addEventListener("click", event => {

                event.stopPropagation();

                abrirWhats(cliente.numero);

            });


        // =====================================================
        // EXCLUIR
        // =====================================================

        card
            .querySelector(".btn-excluir")
            .addEventListener("click", event => {

                event.stopPropagation();

                excluirCliente(cliente.id);

            });

    });

}


// =========================================================
// PESQUISA
// =========================================================

function aplicarPesquisa() {

    const campo =
        document.getElementById("pesquisaCliente");

    if (!campo) {
        return;
    }


    const termo =
        campo.value
            .toLowerCase()
            .trim();


    if (!termo) {

        renderizarClientes(clientes);

        return;
    }


    const resultado =
        clientes.filter(cliente => {

            const nome =
                String(cliente.name || "")
                    .toLowerCase();

            const numero =
                String(cliente.numero || "")
                    .toLowerCase();

            const usuario =
                String(cliente.usuario || "")
                    .toLowerCase();

            const aplicativo =
                String(cliente.aplicativo || "")
                    .toLowerCase();

            const plano =
                String(cliente.plano || "")
                    .toLowerCase();


            return (
                nome.includes(termo) ||
                numero.includes(termo) ||
                usuario.includes(termo) ||
                aplicativo.includes(termo) ||
                plano.includes(termo)
            );

        });


    renderizarClientes(resultado);

}


// =========================================================
// ABRIR MODAL NOVO CLIENTE
// =========================================================

function abrirModalNovoCliente() {

    const modal =
        document.getElementById("modalCliente");

    const formulario =
        document.getElementById("formCliente");

    const clienteId =
        document.getElementById("clienteId");

    const titulo =
        document.getElementById("tituloModal");


    if (!modal || !formulario) {

        console.error(
            "Modal ou formulário não encontrado."
        );

        return;
    }


    formulario.reset();


    if (clienteId) {
        clienteId.value = "";
    }


    if (titulo) {
        titulo.textContent = "Novo Cliente";
    }


    const telas =
        document.getElementById("telas");

    if (telas) {
        telas.value = "1";
    }


    const hoje =
        new Date();

    const dataHoje =
        `${String(hoje.getDate()).padStart(2, "0")}/` +
        `${String(hoje.getMonth() + 1).padStart(2, "0")}/` +
        `${hoje.getFullYear()}`;


    const dataInicio =
        document.getElementById("dataInicio");

    if (dataInicio) {
        dataInicio.value = dataHoje;
    }


    modal.classList.add("ativo");

}


// =========================================================
// FECHAR MODAL
// =========================================================

function fecharModalCliente() {

    const modal =
        document.getElementById("modalCliente");

    if (!modal) {
        return;
    }

    modal.classList.remove("ativo");

}


// =========================================================
// EDITAR CLIENTE
// =========================================================

async function editarCliente(id) {

    try {

        console.log("Editando cliente:", id);


        const resposta =
            await fetch(
                `/api/clientes/${id}`,
                {
                    credentials: "same-origin"
                }
            );


        if (resposta.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível buscar o cliente."
            );

        }


        const cliente =
            await resposta.json();


        console.log(
            "Cliente recebido:",
            cliente
        );


        document.getElementById("clienteId").value =
            cliente.id || "";


        document.getElementById("nome").value =
            cliente.name || "";


        document.getElementById("whatsapp").value =
            cliente.numero || "";


        document.getElementById("usuario").value =
            cliente.usuario || "";


        document.getElementById("aplicativo").value =
            cliente.aplicativo || "";


        document.getElementById("plano").value =
            cliente.plano || "";


        document.getElementById("valor").value =
            cliente.valor ?? "";


        document.getElementById("telas").value =
            cliente.telas || 1;


        document.getElementById("descricao").value =
            cliente.descricao || "";


        preencherDataTexto(
            "dataInicio",
            cliente.dataInicio
        );


        preencherDataTexto(
            "data_pagamento",
            cliente.dataPagamento ||
            cliente.data_pagamento
        );


        preencherDataTexto(
            "data_expiracao",
            cliente.dataExpiracao ||
            cliente.data_expiracao
        );


        const titulo =
            document.getElementById("tituloModal");

        if (titulo) {
            titulo.textContent = "Editar Cliente";
        }


        const modal =
            document.getElementById("modalCliente");

        if (modal) {
            modal.classList.add("ativo");
        }


    } catch (erro) {

        console.error(
            "Erro ao editar cliente:",
            erro
        );

        alert(
            "Não foi possível carregar os dados do cliente."
        );

    }

}


// =========================================================
// SALVAR / ATUALIZAR CLIENTE
// =========================================================

async function salvarCliente(event) {

    event.preventDefault();


    const clienteId =
        document.getElementById("clienteId").value.trim();


    const nome =
        document.getElementById("nome").value.trim();

    const whatsapp =
        document.getElementById("whatsapp").value.trim();

    const usuario =
        document.getElementById("usuario").value.trim();

    const aplicativo =
        document.getElementById("aplicativo").value.trim();

    const plano =
        document.getElementById("plano").value.trim();

    const valor =
        document.getElementById("valor").value;

    const telas =
        document.getElementById("telas").value;

    const dataInicio =
        converterDataParaBanco(
            document.getElementById("dataInicio").value
        );

    const dataPagamento =
        converterDataParaBanco(
            document.getElementById("data_pagamento").value
        );

    const dataExpiracao =
        converterDataParaBanco(
            document.getElementById("data_expiracao").value
        );

    const descricao =
        document.getElementById("descricao").value.trim();


    if (
        !nome ||
        !whatsapp ||
        !usuario ||
        !aplicativo ||
        !dataPagamento ||
        !dataExpiracao
    ) {

        alert(
            "Preencha todos os campos obrigatórios."
        );

        return;
    }


    const dados = {

        name: nome,

        numero: whatsapp,

        usuario: usuario,

        aplicativo: aplicativo,

        plano: plano,

        valor:
            Number(valor || 0),

        telas:
            Number(telas || 1),

        dataInicio:
            dataInicio,

        dataPagamento:
            dataPagamento,

        dataExpiracao:
            dataExpiracao,

        descricao:
            descricao

    };


    const botao =
        document.getElementById("btnSalvarCliente");


    const textoOriginal =
        botao.innerHTML;


    try {

        botao.disabled = true;

        botao.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Salvando...`;


        const url =
            clienteId
            ?
            `/api/clientes/${clienteId}`
            :
            "/api/clientes";


        const metodo =
            clienteId
            ?
            "PUT"
            :
            "POST";


        console.log(
            metodo,
            url,
            dados
        );


        const resposta =
            await fetch(
                url,
                {
                    method: metodo,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(dados)
                }
            );


        const resultado =
            await resposta.json();


        if (resposta.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                resultado.detalhe ||
                "Erro ao salvar cliente."
            );

        }


        alert(
            clienteId
            ?
            "Cliente atualizado com sucesso!"
            :
            "Cliente cadastrado com sucesso!"
        );


        fecharModalCliente();


        await carregarClientes();


    } catch (erro) {

        console.error(
            "Erro ao salvar cliente:",
            erro
        );


        alert(
            erro.message ||
            "Erro ao salvar cliente."
        );


    } finally {

        botao.disabled = false;

        botao.innerHTML =
            textoOriginal;

    }

}


// =========================================================
// RENOVAR
// =========================================================

async function renovarCliente(id) {

    const confirmar =
        confirm(
            "Deseja renovar este cliente?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/clientes/renovar/${id}`,
                {
                    method: "PUT",

                    credentials:
                        "same-origin"
                }
            );


        const dados =
            await resposta.json();


        if (resposta.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao renovar cliente."
            );

        }


        alert(
            dados.mensagem ||
            "Cliente renovado com sucesso!"
        );


        await carregarClientes();


    } catch (erro) {

        console.error(erro);

        alert(
            erro.message ||
            "Erro ao renovar cliente."
        );

    }

}


// =========================================================
// EXCLUIR
// =========================================================

async function excluirCliente(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este cliente?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/clientes/${id}`,
                {
                    method: "DELETE",

                    credentials:
                        "same-origin"
                }
            );


        const dados =
            await resposta.json();


        if (resposta.status === 401) {

            window.location.href =
                "login.html";

            return;
        }


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao excluir cliente."
            );

        }


        alert(
            dados.mensagem ||
            "Cliente excluído com sucesso!"
        );


        await carregarClientes();


    } catch (erro) {

        console.error(erro);

        alert(
            erro.message ||
            "Erro ao excluir cliente."
        );

    }

}


// =========================================================
// WHATSAPP
// =========================================================

function abrirWhats(numero) {

    if (!numero) {

        alert(
            "Este cliente não possui WhatsApp."
        );

        return;
    }


    let telefone =
        String(numero)
            .replace(/\D/g, "");


    if (
        telefone.length === 10 ||
        telefone.length === 11
    ) {

        telefone =
            "55" + telefone;

    }


    if (telefone.length < 12) {

        alert(
            "Número de WhatsApp inválido."
        );

        return;
    }


    const mensagem =
        encodeURIComponent(
            "Olá! Tudo bem?"
        );


    const url =
        `https://wa.me/${telefone}?text=${mensagem}`;


    window.open(
        url,
        "_blank"
    );

}


// =========================================================
// STATUS
// =========================================================

function calcularStatus(cliente) {

    if (!cliente.dataExpiracao) {

        return {
            texto: "Inativo",
            classe: "status-inativo"
        };

    }


    const hoje =
        criarDataLocalHoje();


    const vencimento =
        criarDataLocal(
            cliente.dataExpiracao
        );


    if (!vencimento) {

        return {
            texto: "Inativo",
            classe: "status-inativo"
        };

    }


    hoje.setHours(0, 0, 0, 0);

    vencimento.setHours(0, 0, 0, 0);


    const diferenca =
        Math.ceil(
            (
                vencimento -
                hoje
            ) /
            (1000 * 60 * 60 * 24)
        );


    if (
        String(cliente.status || "")
            .toLowerCase() === "inativo"
    ) {

        return {
            texto: "Inativo",
            classe: "status-inativo"
        };

    }


    if (diferenca < 0) {

        return {
            texto: "Inativo",
            classe: "status-inativo"
        };

    }


    if (diferenca <= 3) {

        return {
            texto: "Vencendo",
            classe: "status-vencendo"
        };

    }


    return {
        texto: "Ativo",
        classe: "status-ativo"
    };

}


// =========================================================
// DATAS
// =========================================================

function converterDataParaBanco(valor) {

    if (!valor) {
        return "";
    }


    const texto =
        valor.trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {

        return texto;

    }


    if (
        /^\d{2}\/\d{2}\/\d{4}$/.test(texto)
    ) {

        const [dia, mes, ano] =
            texto.split("/");


        return `${ano}-${mes}-${dia}`;

    }


    return "";

}


function preencherDataTexto(id, valor) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return;
    }


    if (!valor) {

        elemento.value = "";

        return;
    }


    const texto =
        String(valor)
            .split("T")[0];


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {

        const [ano, mes, dia] =
            texto.split("-");


        elemento.value =
            `${dia}/${mes}/${ano}`;

        return;
    }


    elemento.value =
        valor;

}


function formatarData(data) {

    if (!data) {
        return "-";
    }


    const texto =
        String(data)
            .split("T")[0];


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {

        const [ano, mes, dia] =
            texto.split("-");


        return `${dia}/${mes}/${ano}`;

    }


    return String(data);

}


function criarDataLocal(valor) {

    if (!valor) {
        return null;
    }


    const texto =
        String(valor)
            .split("T")[0];


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(texto)
    ) {

        const [ano, mes, dia] =
            texto.split("-");


        return new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia)
        );

    }


    const data =
        new Date(valor);


    return isNaN(data.getTime())
        ? null
        : data;

}


function criarDataLocalHoje() {

    const hoje =
        new Date();


    return new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

}


// =========================================================
// VALOR
// =========================================================

function formatarValor(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =========================================================
// EVENTOS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const formulario =
            document.getElementById("formCliente");


        if (formulario) {

            formulario.addEventListener(
                "submit",
                salvarCliente
            );

        }


        const fechar =
            document.getElementById("fecharModal");

        if (fechar) {

            fechar.addEventListener(
                "click",
                fecharModalCliente
            );

        }


        const fecharX =
            document.getElementById("fecharModalX");

        if (fecharX) {

            fecharX.addEventListener(
                "click",
                fecharModalCliente
            );

        }


        const modal =
            document.getElementById("modalCliente");


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        fecharModalCliente();

                    }

                }
            );

        }


        document.addEventListener(
            "input",
            event => {

                if (
                    event.target &&
                    event.target.id ===
                    "pesquisaCliente"
                ) {

                    aplicarPesquisa();

                }

            }
        );


        // Calendário de cadastro

        configurarCalendario(
            "calendarioInicio",
            "dataInicio"
        );


        configurarCalendario(
            "calendarioPagamento",
            "data_pagamento"
        );


        configurarCalendario(
            "calendarioExpiracao",
            "data_expiracao"
        );

    }
);


// =========================================================
// CALENDÁRIOS
// =========================================================

function configurarCalendario(
    calendarioId,
    campoId
) {

    const calendario =
        document.getElementById(calendarioId);


    const campo =
        document.getElementById(campoId);


    if (!calendario || !campo) {
        return;
    }


    calendario.addEventListener(
        "change",
        () => {

            if (!calendario.value) {
                return;
            }


            const [ano, mes, dia] =
                calendario.value.split("-");


            campo.value =
                `${dia}/${mes}/${ano}`;

        }
    );

}


// =========================================================
// EXPORTAR
// =========================================================

window.carregarClientes =
    carregarClientes;

window.renderizarClientes =
    renderizarClientes;

window.abrirModalNovoCliente =
    abrirModalNovoCliente;

window.fecharModalCliente =
    fecharModalCliente;

window.editarCliente =
    editarCliente;

window.salvarCliente =
    salvarCliente;

window.renovarCliente =
    renovarCliente;

window.excluirCliente =
    excluirCliente;

window.abrirWhats =
    abrirWhats;

window.aplicarPesquisa =
    aplicarPesquisa;





