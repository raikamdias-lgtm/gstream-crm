console.log("FINANCEIRO JS CARREGADO");


// =========================================================
// CARREGAR FINANCEIRO
// =========================================================

async function carregarFinanceiro() {

    try {

        const resumoResposta =
            await fetch(
                "/api/pagamentos/resumo",
                {
                    credentials: "same-origin"
                }
            );


        if (!resumoResposta.ok) {

            throw new Error(
                "Erro ao carregar resumo financeiro."
            );

        }


        const resumo =
            await resumoResposta.json();


        if (!resumo.sucesso) {

            throw new Error(
                resumo.erro ||
                "Erro no resumo financeiro."
            );

        }


        // =====================================================
        // RECEITA DO MÊS
        // =====================================================

        const receita =
            document.getElementById(
                "receitaMensal"
            );


        if (receita) {

            receita.textContent =
                formatarMoeda(
                    resumo.receitaMensal
                );

        }


        // =====================================================
        // CLIENTES PAGANTES
        // =====================================================

        const clientesPagantes =
            document.getElementById(
                "clientesPagantes"
            );


        if (clientesPagantes) {

            clientesPagantes.textContent =
                resumo.clientesPagantes || 0;

        }


        // =====================================================
        // TELAS ATIVAS
        // =====================================================

        const totalTelas =
            document.getElementById(
                "totalTelas"
            );


        if (totalTelas) {

            totalTelas.textContent =
                resumo.totalTelas || 0;

        }


        // =====================================================
        // A RECEBER
        // =====================================================

        const aReceber =
            document.getElementById(
                "aReceber"
            );


        if (aReceber) {

            aReceber.textContent =
                formatarMoeda(
                    resumo.aReceber
                );

        }


        // =====================================================
        // HISTÓRICO
        // =====================================================

        await carregarHistoricoPagamentos();


    }

    catch (error) {

        console.error(
            "Erro ao carregar financeiro:",
            error
        );

    }

}


// =========================================================
// CARREGAR HISTÓRICO DE PAGAMENTOS
// =========================================================

async function carregarHistoricoPagamentos() {

    try {

        const resposta =
            await fetch(
                "/api/pagamentos",
                {
                    credentials: "same-origin"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar pagamentos."
            );

        }


        const dados =
            await resposta.json();


        if (!dados.sucesso) {

            throw new Error(
                dados.erro ||
                "Erro ao carregar pagamentos."
            );

        }


        const pagamentos =
            dados.pagamentos || [];


        const lista =
            document.getElementById(
                "listaFinanceiro"
            );


        if (!lista) {

            console.warn(
                "Elemento #listaFinanceiro não encontrado."
            );

            return;

        }


        let totalHistorico = 0;


        // =====================================================
        // CABEÇALHO
        // =====================================================

        lista.innerHTML = `

            <div class="historico-topo">

                <div>

                    <h2>
                        Histórico de pagamentos
                    </h2>

                    <p>
                        Pagamentos registrados no sistema
                    </p>

                </div>

                <strong id="receitaHistorico">
                    R$ 0,00
                </strong>

            </div>


            <div
                id="historicoPagamentos"
                class="historico-lista"
            ></div>

        `;


        const historico =
            document.getElementById(
                "historicoPagamentos"
            );


        if (!historico) {
            return;
        }


        // =====================================================
        // NENHUM PAGAMENTO
        // =====================================================

        if (pagamentos.length === 0) {

            historico.innerHTML = `

                <div class="sem-pagamentos">

                    <i class="fa-solid fa-receipt"></i>

                    <h3>
                        Nenhum pagamento registrado
                    </h3>

                    <p>
                        Os pagamentos aparecerão aqui.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================================
        // PAGAMENTOS
        // =====================================================

        pagamentos.forEach(
            pagamento => {

                const valor =
                    Number(
                        pagamento.valor
                    ) || 0;


                totalHistorico += valor;


                const status =
                    pagamento.status ||
                    "pago";


                historico.innerHTML += `

                    <div class="pagamento-item">

                        <div class="pagamento-principal">

                            <div class="pagamento-icone">

                                <i class="fa-solid fa-user"></i>

                            </div>


                            <div class="pagamento-cliente">

                                <h3>

                                    ${escaparHTML(
                                        pagamento.cliente ||
                                        "Cliente"
                                    )}

                                </h3>


                                <div class="pagamento-detalhes">

                                    <span>

                                        <i class="fa-solid fa-tv"></i>

                                        ${pagamento.telas || 1}
                                        tela(s)

                                    </span>


                                    <span>

                                        <i class="fa-solid fa-box"></i>

                                        ${escaparHTML(
                                            pagamento.plano ||
                                            "-"
                                        )}

                                    </span>


                                    <span>

                                        <i class="fa-regular fa-calendar"></i>

                                        ${formatarData(
                                            pagamento.data_pagamento
                                        )}

                                    </span>

                                </div>

                            </div>

                        </div>


                        <div class="pagamento-valor">

                            <strong>

                                ${formatarMoeda(
                                    valor
                                )}

                            </strong>


                            <span class="status-pagamento">

                                ${escaparHTML(
                                    status
                                )}

                            </span>

                        </div>

                    </div>

                `;

            }
        );


        // =====================================================
        // TOTAL DO HISTÓRICO
        // =====================================================

        const receitaHistorico =
            document.getElementById(
                "receitaHistorico"
            );


        if (receitaHistorico) {

            receitaHistorico.textContent =
                formatarMoeda(
                    totalHistorico
                );

        }

    }

    catch (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );

    }

}


// =========================================================
// ABRIR MODAL DE PAGAMENTO
// =========================================================

async function abrirModalPagamento() {

    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (!modal) {

        console.error(
            "Modal #modalPagamento não encontrado."
        );

        return;

    }


    await carregarClientesPagamento();


    const data =
        document.getElementById(
            "dataPagamento"
        );


    if (data && !data.value) {

        data.value =
            obterDataAtual();

    }


    const valor =
        document.getElementById(
            "valorPagamento"
        );


    if (valor) {

        valor.value = "";

    }


    const descricao =
        document.getElementById(
            "descricaoPagamento"
        );


    if (descricao) {

        descricao.value = "";

    }


    modal.classList.add(
        "ativo"
    );

}


// =========================================================
// FECHAR MODAL
// =========================================================

function fecharModalPagamento() {

    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "ativo"
    );

}


// =========================================================
// CARREGAR CLIENTES NO SELECT
// =========================================================

async function carregarClientesPagamento() {

    const select =
        document.getElementById(
            "clientePagamento"
        );


    if (!select) {

        console.error(
            "Select #clientePagamento não encontrado."
        );

        return;

    }


    try {

        select.innerHTML = `

            <option value="">
                Carregando clientes...
            </option>

        `;


        const resposta =
            await fetch(
                "/api/clientes",
                {
                    credentials: "same-origin"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar clientes."
            );

        }


        const dados =
            await resposta.json();


        const clientes =
            dados.clientes ||
            dados.data ||
            [];


        select.innerHTML = `

            <option value="">
                Selecione um cliente
            </option>

        `;


        if (!Array.isArray(clientes) ||
            clientes.length === 0) {

            select.innerHTML += `

                <option value="">
                    Nenhum cliente encontrado
                </option>

            `;

            return;

        }


        clientes.forEach(
            cliente => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    cliente.id;


                option.textContent =
                    cliente.name ||
                    cliente.nome ||
                    "Cliente";


                option.dataset.valor =
                    cliente.valor || 0;


                select.appendChild(
                    option
                );

            }
        );


        // =====================================================
        // PREENCHER VALOR AUTOMATICAMENTE
        // =====================================================

        select.onchange =
            function () {

                const opcao =
                    this.options[
                        this.selectedIndex
                    ];


                const valor =
                    opcao.dataset.valor;


                const campoValor =
                    document.getElementById(
                        "valorPagamento"
                    );


                if (
                    campoValor &&
                    valor
                ) {

                    campoValor.value =
                        Number(valor).toFixed(2);

                }

            };


    }

    catch (error) {

        console.error(
            "Erro ao carregar clientes para pagamento:",
            error
        );


        select.innerHTML = `

            <option value="">
                Erro ao carregar clientes
            </option>

        `;

    }

}


// =========================================================
// REGISTRAR PAGAMENTO
// =========================================================

async function registrarPagamento() {

    const cliente =
        document.getElementById(
            "clientePagamento"
        );


    const valor =
        document.getElementById(
            "valorPagamento"
        );


    const data =
        document.getElementById(
            "dataPagamento"
        );


    const descricao =
        document.getElementById(
            "descricaoPagamento"
        );


    if (!cliente ||
        !valor ||
        !data) {

        console.error(
            "Campos do pagamento não encontrados."
        );

        return;

    }


    const clienteId =
        cliente.value;


    const valorPagamento =
        Number(
            String(
                valor.value
            ).replace(
                ",",
                "."
            )
        );


    const dataPagamento =
        data.value;


    const descricaoPagamento =
        descricao
            ? descricao.value.trim()
            : "";


    // =====================================================
    // VALIDAÇÕES
    // =====================================================

    if (!clienteId) {

        alert(
            "Selecione um cliente."
        );

        return;

    }


    if (
        !valorPagamento ||
        valorPagamento <= 0
    ) {

        alert(
            "Informe um valor de pagamento válido."
        );

        return;

    }


    if (!dataPagamento) {

        alert(
            "Informe a data do pagamento."
        );

        return;

    }


    // =====================================================
    // BOTÃO
    // =====================================================

    const botao =
        document.getElementById(
            "btnRegistrarPagamento"
        );


    const textoOriginal =
        botao
            ? botao.innerHTML
            : "";


    if (botao) {

        botao.disabled = true;

        botao.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Registrando...

        `;

    }


    try {

        const resposta =
            await fetch(
                "/api/pagamentos",
                {

                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            cliente_id:
                                Number(
                                    clienteId
                                ),

                            valor:
                                valorPagamento,

                            data_pagamento:
                                dataPagamento,

                            descricao:
                                descricaoPagamento

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok ||
            !dados.sucesso) {

            throw new Error(
                dados.erro ||
                "Não foi possível registrar o pagamento."
            );

        }


        // =====================================================
        // SUCESSO
        // =====================================================

        alert(
            "Pagamento registrado com sucesso!"
        );


        fecharModalPagamento();


        await carregarFinanceiro();


    }

    catch (error) {

        console.error(
            "Erro ao registrar pagamento:",
            error
        );


        alert(
            error.message ||
            "Erro ao registrar pagamento."
        );

    }

    finally {

        if (botao) {

            botao.disabled = false;

            botao.innerHTML =
                textoOriginal;

        }

    }

}


// =========================================================
// OBTER DATA ATUAL
// =========================================================

function obterDataAtual() {

    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoje.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${ano}-${mes}-${dia}`;

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escaparHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }


    return String(texto)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// MOEDA
// =========================================================

function formatarMoeda(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {

            style: "currency",

            currency: "BRL"

        }
    );

}


// =========================================================
// DATA
// =========================================================

function formatarData(data) {

    if (!data) {

        return "-";

    }


    const partes =
        String(data).split("-");


    if (
        partes.length === 3
    ) {

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    return data;

}


// =========================================================
// FECHAR MODAL CLICANDO FORA
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "modalPagamento"
            );


        if (!modal) {
            return;
        }


        if (
            event.target === modal
        ) {

            fecharModalPagamento();

        }

    }
);


// =========================================================
// DISPONIBILIZAR FUNÇÕES
// =========================================================

window.carregarFinanceiro =
    carregarFinanceiro;


window.carregarHistoricoPagamentos =
    carregarHistoricoPagamentos;


window.abrirModalPagamento =
    abrirModalPagamento;


window.fecharModalPagamento =
    fecharModalPagamento;


window.carregarClientesPagamento =
    carregarClientesPagamento;


window.registrarPagamento =
    registrarPagamento;