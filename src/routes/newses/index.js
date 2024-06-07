import express from "express";
import News from "../../database/services/news.service.js";
import asyncHandler from "../../helpers/asyncHandler.js";
import validator, { ValidationSource } from "../../helpers/validator.js";
import schema from "./schema.js";
import { SuccessResponse } from "../../core/ApiResponse.js";
import auth from "../../middlewares/auth.middleware.js";
import { BadRequestError } from "../../core/ApiError.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/newses/latest:
 *   get:
 *     tags:
 *       - News
 *     summary: Get latest news
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       '200':
 *         description: A list of latest news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       '400':
 *         description: Bad request, invalid pagination parameters
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/latest",
  validator(schema.pagination, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    const latestNews = await News.findLatestNews();
    new SuccessResponse("Success", latestNews).send(res);
  })
);

router.use(auth);

/**
 * @swagger
 * /api/v1/newses/latest:
 *   post:
 *     tags:
 *       - News
 *     summary: Create a new news item
 *     security:
 *       - bearerAuth: []  # Add security scheme for access token (if applicable)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: News created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized (if using access token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Error creating news item"
 */
router.post(
  "/",
  validator(schema.newsCreate),
  asyncHandler(async (req, res) => {
    const createdNews = await News.create({
      title: req.body.title,
      content: req.body.content,
      isPublished: req.body.isPublished,
      author: req.user,
    });
    new SuccessResponse("News created successfully", createdNews).send(res);
  })
);
/**
 * @swagger
 * /api/v1/newses/{id}:
 *   put:
 *     tags:
 *       - News
 *     summary: Update an existing news item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the news item to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewsUpdate'
 *     responses:
 *       200:
 *         description: News updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request (validation error or news not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *               or:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "News does not exist"
 *       401:
 *         description: Unauthorized (if using access token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Error updating news item"
 */
router.put(
  "/:id",
  validator(schema.newsId, ValidationSource.PARAM),
  validator(schema.newsUpdate),
  asyncHandler(async (req, res) => {
    const news = await News.findInfoById(req.params.id);
    if (news == null) throw new BadRequestError("News does not exists");

    const updatedNews = await News.update({
      id: req.params.id,
      isPublished: req.body.isPublished,
    });

    new SuccessResponse("News updated successfully", updatedNews).send(res);
  })
);

export default router;
