import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import ledgerRouter from "./ledger";
import transactionsRouter from "./transactions";
import customersRouter from "./customers";
import vendorsRouter from "./vendors";
import reportsRouter from "./reports";
import analyticsRouter from "./analytics";
import profileRouter from "./profile";
import settingsRouter from "./settings";
import hotelsRouter from "./hotels";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(ledgerRouter);
router.use(transactionsRouter);
router.use(customersRouter);
router.use(vendorsRouter);
router.use(reportsRouter);
router.use(analyticsRouter);
router.use(profileRouter);
router.use(settingsRouter);
router.use(hotelsRouter);
router.use(categoriesRouter);

router.get("/", (_req, res) => {
  res.json({ status: "ok", route: "/api" });
});

export default router;