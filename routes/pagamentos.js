const express = require("express");

const router = express.Router();

const pagamentoController =
    require("../controllers/pagamentoController");


// ==========================
// RESUMO FINANCEIRO
// ==========================

router.get(
    "/resumo",
    pagamentoController.resumo
);


// ==========================
// LISTAR PAGAMENTOS
// ==========================

router.get(
    "/",
    pagamentoController.listar
);


// ==========================
// REGISTRAR PAGAMENTO
// ==========================

router.post(
    "/",
    pagamentoController.registrar
);


// ==========================
// MARCAR PAGAMENTO COMO PAGO
// ==========================

router.put(
    "/:id/pagar",
    pagamentoController.marcarComoPago
);


module.exports = router;
