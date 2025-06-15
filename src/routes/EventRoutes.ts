import { Router } from "express";
import { EventController } from "../controller/eventController";

const router = Router();

router.get("/all",EventController.getAll);
router.get("/get/:id",EventController.getById);
router.get("/getByOrgizerId",EventController.getByOrganizerId);
router.post("/create",EventController.create);
router.put("/update/:id",EventController.update);
router.delete("/delete/:id",EventController.delete);

export const eventRoute= router;
