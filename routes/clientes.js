const express = require("express");

const router = express.Router();

const clienteController =
    require("../controllers/clienteController");


/* =========================================================
   DASHBOARD
========================================================= */

router.get(
    "/dashboard",
    clienteController.dashboard
);


/* =========================================================
   RENOVAR CLIENTE
========================================================= */

router.put(
    "/renovar/:id",
    clienteController.renovar
);


/* =========================================================
   LISTAR CLIENTES
========================================================= */

router.get(
    "/",
    clienteController.listar
);


/* =========================================================
   BUSCAR CLIENTE
========================================================= */

router.get(
    "/:id",
    clienteController.buscar
);


/* =========================================================
   CADASTRAR CLIENTE
========================================================= */

router.post(
    "/",
    clienteController.cadastrar
);


/* =========================================================
   ATUALIZAR CLIENTE
========================================================= */

router.put(
    "/:id",
    clienteController.atualizar
);


/* =========================================================
   EXCLUIR CLIENTE
========================================================= */

router.delete(
    "/:id",
    clienteController.excluir
);


module.exports = router;

