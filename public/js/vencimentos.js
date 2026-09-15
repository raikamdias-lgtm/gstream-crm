console.log("VENCIMENTOS JS CARREGADO");


// =========================================================
// CARREGAR VENCIMENTOS
// =========================================================

async function carregarVencimentos() {

    try {

        const resposta = await fetch("/api/clientes", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao buscar clientes.");
        }

        const clientes = await resposta.json();

        const lista =
            document.getElementById("listaVencimentos");

        if (!lista) {
            console.warn(
                "Elemento #listaVencimentos não encontrado."
            );
            return;
        }

        lista.innerHTML = "";

        const hoje = new Date();

        // Remove horas para evitar problemas de comparação
        hoje.setHours(0, 0, 0, 0);


        // =====================================================
        // FILTRAR CLIENTES VENCENDO
        // =====================================================

        const vencendo = clientes.filter(cliente => {

            if (!cliente.dataExpiracao) {
                return false;
            }

            const data = new Date(
                cliente.dataExpiracao + "T00:00:00"
            );

            if (isNaN(data.getTime())) {
                return false;
            }

            const diferenca =
                data.getTime() - hoje.getTime();

            const dias =
                Math.ceil(
                    diferenca /
                    (1000 * 60 * 60 * 24)
                );

            return dias >= 0 && dias <= 3;

        });


        // =====================================================
        // NENHUM VENCIMENTO
        // =====================================================

        if (vencendo.length === 0) {

            lista.innerHTML = `

                <div class="sem-clientes">

                    <i class="fa-solid fa-circle-check"></i>

                    <p>
                        Nenhum cliente vencendo nos próximos 3 dias.
                    </p>

                </div>

            `;

            return;
        }


        // =====================================================
        // MOSTRAR CLIENTES
        // =====================================================

        vencendo.forEach(cliente => {

            const numero =
                cliente.numero || "";

            const nome =
                cliente.name || "Cliente";

            const vencimento =
                formatarData(
                    cliente.dataExpiracao
                );

            const plano =
                cliente.plano || "-";

            const valor =
                Number(cliente.valor || 0)
                    .toFixed(2)
                    .replace(".", ",");


            lista.innerHTML += `

                <div class="cliente-card compacto">

                    <div class="cliente-info">

                        <h3>
                            ${escaparHTML(nome)}
                        </h3>

                        <p>
                            <strong>Plano:</strong>
                            ${escaparHTML(plano)}
                        </p>

                        <p>
                            <strong>Valor:</strong>
                            R$ ${valor}
                        </p>

                        <p>
                            <strong>Vencimento:</strong>
                            ${vencimento}
                        </p>

                    </div>


                    <div class="acoes-vencimento">

                        <button
                            type="button"
                            class="btn-cobrar"
                            onclick="enviarCobranca(
                                '${escaparJS(numero)}',
                                '${escaparJS(nome)}',
                                '${escaparJS(cliente.dataExpiracao)}'
                            )"
                        >

                            <i class="fa-brands fa-whatsapp"></i>

                            Cobrar

                        </button>

                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.error(
            "Erro ao carregar vencimentos:",
            error
        );

        const lista =
            document.getElementById(
                "listaVencimentos"
            );

        if (lista) {

            lista.innerHTML = `

                <div class="sem-clientes">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Não foi possível carregar os vencimentos.
                    </p>

                </div>

            `;

        }

    }

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escaparHTML(texto) {

    if (texto === null || texto === undefined) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// ESCAPAR JAVASCRIPT
// =========================================================

function escaparJS(texto) {

    if (texto === null || texto === undefined) {
        return "";
    }

    return String(texto)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");

}


// =========================================================
// DISPONIBILIZAR
// =========================================================

window.carregarVencimentos =
    carregarVencimentos;

    // =========================================================
// COBRAR CLIENTE PELO WHATSAPP
// =========================================================

function enviarCobranca(
    numero,
    nome,
    dataExpiracao
) {

    if (!numero) {

        alert(
            "Este cliente não possui número de WhatsApp."
        );

        return;
    }


    // Remove tudo que não for número

    let telefone =
        String(numero).replace(/\D/g, "");


    // Adiciona código do Brasil

    if (
        telefone.length === 10 ||
        telefone.length === 11
    ) {

        telefone =
            "55" + telefone;

    }


    // Formata a data

    const vencimento =
        typeof formatarData === "function"
            ? formatarData(dataExpiracao)
            : dataExpiracao;


    // Mensagem

    const mensagem =
        `Olá, ${nome}! 😊\n\n` +
        `Passando para lembrar que seu plano vence em ${vencimento}.\n\n` +
        `Gostaria de realizar a renovação?`;


    // Link do WhatsApp

    const url =
        `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;


    // Abre o WhatsApp

    window.open(
        url,
        "_blank"
    );
}


// Disponibilizar globalmente

window.enviarCobranca =
    enviarCobranca;