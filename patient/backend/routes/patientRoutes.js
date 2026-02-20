const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const ctrl = require("../controllers/patientController");

// PDF Upload route MUST be before /:id to avoid conflicts
router.post("/upload", upload.single("pdf"), ctrl.parsePDF);

router.get("/", ctrl.getAllPatients);
router.get("/:id", ctrl.getPatient);
router.get("/audit/:id", ctrl.getAuditLogs);
router.post("/", ctrl.createPatient);
router.put("/:id", ctrl.updatePatient);
router.delete("/:id", ctrl.deletePatient);

module.exports = router;