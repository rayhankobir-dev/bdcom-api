import express from "express";
import crypto from "crypto";
import asyncHandler from "../../helpers/asyncHandler.js";
import User from "../../database/services/user.service.js";
import { SuccessResponse } from "../../core/ApiResponse.js";
import { BadRequestError } from "../../core/ApiError.js";
import { createTokens } from "../../helpers/authUtils.js";
import { getUserData } from "../../helpers/utils.js";
import validator from "../../helpers/validator.js";
import schema from "./schema.js";
import bcrypt from "bcrypt";

const router = express.Router();

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User signup
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Signup successful
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
 */
router.post(
  "/",
  validator(schema.signup),
  asyncHandler(async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (user) throw new BadRequestError("User already registered");

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const { user: createdUser, keys } = await User.create(
      {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      },
      accessTokenKey,
      refreshTokenKey,
      "admin"
    );

    const tokens = await createTokens(
      createdUser,
      keys.primaryKey,
      keys.secondaryKey
    );
    const userData = await getUserData(createdUser);

    console.log(user, tokens);
    new SuccessResponse("Signup Successful", {
      user: userData,
      tokens: tokens,
    }).send(res);
  })
);

export default router;
