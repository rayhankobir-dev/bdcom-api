import { Router } from "express";
import signup from "./auth/signup.js";
import login from "./auth/login.js";
import logout from "./auth/logout.js";
import token from "./auth/token.js";
import credential from "./auth/credential.js";
import profile from "./profile/index.js";
import newses from "./newses/index.js";

const router = new Router();

router.use("/signup", signup);
router.use("/login", login);
router.use("/logout", logout);
router.use("/token", token);
router.use("/credential", credential);
router.use("/profile", profile);
router.use("/newses", newses);

/**
 * @swagger
 * /api/v1/health-check:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current server date and time
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "1/1/2022, 12:00:00 AM"
 */
router.get("/health-check", (req, res) => {
  return res.status(200).json({
    message: new Date().toLocaleString(),
  });
});

export default router;
