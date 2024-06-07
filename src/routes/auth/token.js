import { Router } from "express";
import validator, { ValidationSource } from "../../helpers/validator.js";
import asyncHandler from "../../helpers/asyncHandler.js";
import JWT from "../../core/JWT.js";
import { AuthFailureError } from "../../core/ApiError.js";
import Key from "../../database/services/key.service.js";
import {
  createTokens,
  getAccessToken,
  validateTokenData,
} from "../../helpers/authUtils.js";
import { TokenRefreshResponse } from "../../core/ApiResponse.js";
import User from "../../database/services/user.service.js";
import schema from "./schema.js";
import crypto from "crypto";

const router = new Router();

/**
 * @swagger
 * /api/v1/token/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Uses a valid refresh token to generate a new access token and refresh token pair.
 *     securitySchemes:
 *        bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to be used for generating new tokens.
 *     responses:
 *       200:
 *         description: Refresh successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                  accessToken:
 *                       type: string
 *                  refreshToken:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid access or refresh token"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not registered"
 */
router.post(
  "/refresh",
  validator(schema.auth, ValidationSource.HEADER),
  validator(schema.refreshToken),
  asyncHandler(async (req, res) => {
    req.accessToken = getAccessToken(req.headers.authorization); // Express headers are auto converted to lowercase
    const accessTokenPayload = await JWT.decode(req.accessToken);
    console.log(accessTokenPayload);

    validateTokenData(accessTokenPayload);
    const user = await User.findById(accessTokenPayload.sub);
    if (!user) throw new AuthFailureError("User not registered");
    req.user = user;

    const refreshTokenPayload = await JWT.validate(req.body.refreshToken);
    validateTokenData(refreshTokenPayload);

    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
      throw new AuthFailureError("Invalid access token");
    const keystore = await Key.find(
      req.user,
      accessTokenPayload.prm,
      refreshTokenPayload.prm
    );

    if (!keystore) throw new AuthFailureError("Invalid access token");
    await Key.remove(keystore._id);
    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");
    await Key.create(req.user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(
      req.user,
      accessTokenKey,
      refreshTokenKey
    );
    new TokenRefreshResponse(
      "Token Issued",
      tokens.accessToken,
      tokens.refreshToken
    ).send(res);
  })
);

export default router;
