import { Router } from "express";
import User from "../../database/services/user.service.js";
import { SuccessResponse } from "../../core/ApiResponse.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { BadRequestError } from "../../core/ApiError.js";
import asyncHandler from "../../helpers/asyncHandler.js";
import _ from "lodash";

const router = new Router();

/*-------------------------------------------------------------------------*/
router.use(authMiddleware);
/*-------------------------------------------------------------------------*/

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile related endpoints
 * /api/v1/profile/my:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile information of the authenticated user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *       '400':
 *         description: Bad request, user not registered
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/my",
  asyncHandler(async (req, res) => {
    const user = await User.findPrivateProfileById(req.user._id);
    if (!user) throw new BadRequestError("User not registered");

    return new SuccessResponse(
      "success",
      _.pick(user, ["name", "email", "roles"])
    ).send(res);
  })
);

export default router;
