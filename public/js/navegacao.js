console.log("NAVEGAÇÃO JS CARREGADO");


// =========================================================
// NAVEGAÇÃO
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menu =
            document.querySelectorAll(".menu li");

        const pagina =
            document.getElementById("pagina");

        const titulo =
            document.getElementById("tituloPagina");


        if (!pagina) {

            console.error(
                "Elemento #pagina não encontrado."
            );

            return;

        }


        menu.forEach(item => {

            item.addEventListener(
                "click",
                async () => {

                    const paginaNome =
                        item.dataset.page;


                    if (!paginaNome) {
                        return;
                    }


                    // Remover ativo dos outros menus

                    menu.forEach(outro => {

                        outro.classList.remove(
                            "active"
                        );

                    });


                    // Ativar item atual

                    item.classList.add(
                        "active"
                    );


                    await carregarPagina(
                        paginaNome,
                        pagina,
                        titulo
                    );

                }
            );

        });


        // =====================================================
        // ABRIR DASHBOARD AO ENTRAR
        // =====================================================

        const itemDashboard =
            document.querySelector(
                '.menu li[data-page="dashboard"]'
            );


        if (itemDashboard) {

            itemDashboard.classList.add(
                "active"
            );

        }


        carregarPagina(
            "dashboard",
            pagina,
            titulo
        );

    }
);


// =========================================================
// CARREGAR PÁGINA
// =========================================================

async function carregarPagina(
    nome,
    pagina,
    titulo
) {

    if (!pagina) {
        return;
    }


    // =====================================================
    // LIMPAR PÁGINA ANTERIOR
    // =====================================================

    pagina.innerHTML = "";


// =========================================================
// DASHBOARD
// =========================================================

if (nome === "dashboard") {

    if (titulo) {
        titulo.textContent = "Dashboard";
    }

    pagina.innerHTML = `

        <section class="dashboard-container">

            <section class="cards" id="dashboardCards">

                <div class="card">

                    <h3>Clientes Ativos</h3>

                    <span id="ativos">
                        0
                    </span>

                </div>


                <div class="card">

                    <h3>Clientes Inativos</h3>

                    <span id="inativos">
                        0
                    </span>

                </div>


                <div class="card">

                    <h3>Vencendo</h3>

                    <span id="vencendo">
                        0
                    </span>

                </div>


                <div class="card">

                    <h3>Total de Clientes</h3>

                    <span id="total">
                        0
                    </span>

                </div>

            </section>

        </section>

    `;


    if (
        typeof iniciarDashboard ===
        "function"
    ) {

        await iniciarDashboard();

    } else {

        console.error(
            "iniciarDashboard não encontrada."
        );

    }

    return;
}


    // =====================================================
    // CLIENTES
    // =====================================================

    if (nome === "clientes") {

        if (titulo) {
            titulo.textContent =
                "Clientes";
        }


        pagina.innerHTML = `

            <section class="clientes-container">

                <div class="topo-clientes">

                    <h2>
                        Clientes
                    </h2>

                    <button
                        type="button"
                        id="novoCliente"
                    >

                        <i class="fa-solid fa-plus"></i>

                        Novo Cliente

                    </button>

                </div>


                <div class="pesquisa-clientes">

                    <input
                        type="text"
                        id="pesquisaCliente"
                        placeholder="Pesquisar por nome, WhatsApp, usuário, aplicativo ou plano..."
                        autocomplete="off"
                    >

                </div>


                <div
                    id="listaClientes"
                    class="lista-clientes"
                ></div>

            </section>

        `;


        // =================================================
        // NOVO CLIENTE
        // =================================================

        const novoCliente =
            document.getElementById(
                "novoCliente"
            );


        if (novoCliente) {

            novoCliente.addEventListener(
                "click",
                () => {

                    if (
                        typeof abrirModalNovoCliente ===
                        "function"
                    ) {

                        abrirModalNovoCliente();

                    } else {

                        console.error(
                            "abrirModalNovoCliente não encontrada."
                        );

                    }

                }
            );

        }


        // =================================================
        // CARREGAR CLIENTES
        // =================================================

        if (
            typeof carregarClientes ===
            "function"
        ) {

            await carregarClientes();

        } else {

            console.error(
                "carregarClientes não encontrada."
            );

        }

        return;
    }


    // =====================================================
    // VENCIMENTOS
    // =====================================================

    if (nome === "vencimentos") {

        if (titulo) {
            titulo.textContent =
                "Vencimentos";
        }


        pagina.innerHTML = `

            <section class="vencimentos-container">

                <div class="topo-vencimentos">

                    <div>

                        <h2>
                            Vencimentos
                        </h2>

                        <p>
                            Clientes que vencem nos próximos 3 dias.
                        </p>

                    </div>

                </div>


                <div
                    id="listaVencimentos"
                    class="lista-vencimentos"
                ></div>

            </section>

        `;


        if (
            typeof carregarVencimentos ===
            "function"
        ) {

            await carregarVencimentos();

        } else {

            console.error(
                "carregarVencimentos não encontrada."
            );

        }

        return;
    }


    // =====================================================
    // FINANCEIRO
    // =====================================================

    if (nome === "financeiro") {

        if (titulo) {
            titulo.textContent =
                "Financeiro";
        }


        pagina.innerHTML = `

            <section class="financeiro-container">

                <!-- ==========================================
                     TOPO
                     ========================================== -->

                <div class="topo-financeiro">

                    <div>

                        <h2>
                            Financeiro
                        </h2>

                        <p>
                            Controle de pagamentos e receitas.
                        </p>

                    </div>


                </div>


                <!-- ==========================================
                     RESUMO FINANCEIRO
                     ========================================== -->

                <section class="financeiro-cards">

                    <div class="financeiro-card">

                        <div class="financeiro-card-icone">

                            <i class="fa-solid fa-money-bill-wave"></i>

                        </div>

                        <div>

                            <span>
                                Receita do mês
                            </span>

                            <strong id="receitaMensal">
                                R$ 0,00
                            </strong>

                        </div>

                    </div>


                    <div class="financeiro-card">

                        <div class="financeiro-card-icone">

                            <i class="fa-solid fa-users"></i>

                        </div>

                        <div>

                            <span>
                                Clientes pagantes
                            </span>

                            <strong id="clientesPagantes">
                                0
                            </strong>

                        </div>

                    </div>


                    <div class="financeiro-card">

                        <div class="financeiro-card-icone">

                            <i class="fa-solid fa-tv"></i>

                        </div>

                        <div>

                            <span>
                                Telas ativas
                            </span>

                            <strong id="totalTelas">
                                0
                            </strong>

                        </div>

                    </div>


                    <div class="financeiro-card">

                        <div class="financeiro-card-icone">

                            <i class="fa-solid fa-hand-holding-dollar"></i>

                        </div>

                        <div>

                            <span>
                                A receber
                            </span>

                            <strong id="aReceber">
                                R$ 0,00
                            </strong>

                        </div>

                    </div>

                </section>


                <!-- ==========================================
                     HISTÓRICO
                     ========================================== -->

                <section
                    id="listaFinanceiro"
                    class="financeiro-historico"
                ></section>


                <!-- ==========================================
                     MODAL DE PAGAMENTO
                     ========================================== -->

                <div
                    id="modalPagamento"
                    class="modal-pagamento"
                >

                    <div class="modal-pagamento-conteudo">

                        <div class="modal-pagamento-topo">

                            <div>

                                <h2>
                                    Registrar pagamento
                                </h2>

                                <p>
                                    Registre um novo pagamento recebido.
                                </p>

                            </div>


                            <button
                                type="button"
                                class="btn-fechar-pagamento"
                                onclick="fecharModalPagamento()"
                            >

                                <i class="fa-solid fa-xmark"></i>

                            </button>

                        </div>


                        <!-- CLIENTE -->

                        <div class="campo-pagamento">

                            <label for="clientePagamento">
                                Cliente
                            </label>

                            <select
                                id="clientePagamento"
                            >

                                <option value="">
                                    Selecione um cliente
                                </option>

                            </select>

                        </div>


                        <!-- VALOR -->

                        <div class="campo-pagamento">

                            <label for="valorPagamento">
                                Valor
                            </label>

                            <input
                                type="number"
                                id="valorPagamento"
                                placeholder="0,00"
                                min="0"
                                step="0.01"
                            >

                        </div>


                        <!-- DATA -->

                        <div class="campo-pagamento">

                            <label for="dataPagamento">
                                Data do pagamento
                            </label>

                            <input
                                type="date"
                                id="dataPagamento"
                            >

                        </div>


                        <!-- DESCRIÇÃO -->

                        <div class="campo-pagamento">

                            <label for="descricaoPagamento">
                                Descrição
                            </label>

                            <textarea
                                id="descricaoPagamento"
                                rows="3"
                                placeholder="Observação sobre o pagamento..."
                            ></textarea>

                        </div>


                        <!-- AÇÕES -->

                        <div class="acoes-modal-pagamento">

                            <button
                                type="button"
                                class="btn-cancelar-pagamento"
                                onclick="fecharModalPagamento()"
                            >

                                Cancelar

                            </button>


                            <button
                                type="button"
                                id="btnRegistrarPagamento"
                                class="btn-confirmar-pagamento"
                                onclick="registrarPagamento()"
                            >

                                <i class="fa-solid fa-check"></i>

                                Registrar pagamento

                            </button>

                        </div>

                    </div>

                </div>

            </section>

        `;


        // =================================================
        // ABRIR MODAL
        // =================================================

        const btnAbrirPagamento =
            document.getElementById(
                "btnAbrirPagamento"
            );


        if (btnAbrirPagamento) {

            btnAbrirPagamento.addEventListener(
                "click",
                () => {

                    if (
                        typeof abrirModalPagamento ===
                        "function"
                    ) {

                        abrirModalPagamento();

                    } else {

                        console.error(
                            "abrirModalPagamento não encontrada."
                        );

                    }

                }
            );

        }


        // =================================================
        // CARREGAR FINANCEIRO
        // =================================================

        if (
            typeof carregarFinanceiro ===
            "function"
        ) {

            await carregarFinanceiro();

        } else {

            console.error(
                "carregarFinanceiro não encontrada."
            );

        }

        return;
    }


    // =====================================================
    // CONFIGURAÇÕES
    // =====================================================

    if (nome === "config") {

        if (titulo) {
            titulo.textContent =
                "Configurações";
        }


        pagina.innerHTML = `

            <section class="config-container">

                <h2>
                    Configurações
                </h2>

                <p>
                    Futuramente terá algo aqui.
                </p>

            </section>

        `;

        return;
    }


    // =====================================================
    // PÁGINA NÃO ENCONTRADA
    // =====================================================

    pagina.innerHTML = `

        <section class="pagina-vazia">

            <h2>
                Página não encontrada
            </h2>

        </section>

    `;

}


// =========================================================
// EXPORTAR
// =========================================================

window.carregarPagina =
    carregarPagina;




