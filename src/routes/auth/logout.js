import { Router } from "express";
import { SuccessMsgResponse } from "../../core/ApiResponse.js";
import Key from "../../database/services/key.service.js";
import auth from "../../middlewares/auth.middleware.js";
import asyncHandler from "../../helpers/asyncHandler.js";

const router = new Router();

/*-------------------------------------------------------------------------*/
router.use(auth);
/*-------------------------------------------------------------------------*/

/**
 * @swagger
 * /api/v1/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User logout
 *     description: Logout user and invalidate tokens
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout success"
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    await Key.remove(req.keys._id);
    new SuccessMsgResponse("Logout success").send(res);
  })
);

export default router;
