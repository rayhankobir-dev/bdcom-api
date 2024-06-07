import { Router } from "express";
import News from "../../database/services/news.service.js";
import { SuccessResponse } from "../../core/ApiResponse.js";
import asyncHandler from "../../helpers/asyncHandler.js";

const router = new Router();

router.get(
  "/latest",
  asyncHandler(async (req, res) => {
    const news = await News.findLatestNews(
      parseInt(req.query.pageNumber),
      parseInt(req.query.pageItemCount)
    );
    return new SuccessResponse("success", news).send(res);
  })
);

export default router;
