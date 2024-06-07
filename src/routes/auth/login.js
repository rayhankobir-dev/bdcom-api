import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../../database/services/user.service.js";
import Key from "../../database/services/key.service.js";
import asyncHandler from "../../helpers/asyncHandler.js";
import { AuthFailureError, BadRequestError } from "../../core/ApiError.js";
import { createTokens } from "../../helpers/authUtils.js";
import { getUserData } from "../../helpers/utils.js";
import validator from "../../helpers/validator.js";
import schema from "./schema.js";
import { SuccessResponse } from "../../core/ApiResponse.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     description: Authenticate user and return tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 tokens:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authentication failure
 */
router.post(
  "/",
  validator(schema.login),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findByEmail(req.body.email);
      if (!user) throw new BadRequestError("User not registered");
      if (!user.password) throw new BadRequestError("Credential not set");

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) throw new AuthFailureError("Authentication failure");

      const accessTokenKey = crypto.randomBytes(64).toString("hex");
      const refreshTokenKey = crypto.randomBytes(64).toString("hex");

      await Key.create(user, accessTokenKey, refreshTokenKey);
      const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);
      const userData = await getUserData(user);

      new SuccessResponse("Login Success", {
        user: userData,
        tokens: tokens,
      }).send(res);
    } catch (error) {
      console.log(error);
    }
  })
);

export default router;
