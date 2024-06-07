import mongoose, { Types, Schema } from "mongoose";
import { NewsModel } from "../models/news.model.js";
import redis from "../../cache/index.js";

const AUTHOR_DETAIL = "name email";

const cacheNews = async (newsId, news) => {
  await redis.set(`news:${newsId}`, JSON.stringify(news), "EX", 600);
};

const getCachedNews = async (newsId) => {
  const cachedUser = await redis.get(`news:${newsId}`);
  return cachedUser ? JSON.parse(cachedUser) : null;
};

const invalidateCache = async (newsId) => {
  await redis.del(`news:${newsId}`);
};

async function create(news) {
  const createdNews = await NewsModel.create(news);
  return createdNews.toObject();
}

async function update(news) {
  return NewsModel.findByIdAndUpdate(news.id, news, { new: true })
    .lean()
    .exec();
}

async function findInfoById(id) {
  const news = await getCachedNews(id);
  if (news) return news;
  const _id = new Types.ObjectId(id);
  const fetchedNews = NewsModel.findOne({ _id })
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
  cacheNews(id, fetchedNews);
  return fetchedNews;
}

async function findInfoForPublishedById(id) {
  return NewsModel.findOne({ _id: id, isPublished: true, status: true })
    .select("+content")
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findNewsAllDataById(id) {
  return NewsModel.findOne({ _id: id })
    .select("+content +isPublished +createdBy +updatedBy")
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findDetailedNews(query) {
  return NewsModel.find(query)
    .select("+isPublished, createdAt, updatedAt")
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findPublishedById(id) {
  return NewsModel.findOne({
    isPublished: true,
  })
    .select("+content")
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findByTagAndPaginated(pageNumber, limit) {
  return NewsModel.find({ isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findLatestNews(pageNumber, limit) {
  return NewsModel.find({ isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllPublishedForAuthor(user) {
  return NewsModel.find({ author: user, isPublished: true })
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllPublished() {
  return findDetailedNews({ isPublished: true });
}

async function searchSimilarNews(news, limit) {
  return NewsModel.find(
    {
      $text: { $search: news.title, $caseSensitive: false },
      isPublished: true,
      _id: { $ne: news._id },
    },
    {
      similarity: { $meta: "textScore" },
    }
  )
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .sort({ similarity: { $meta: "textScore" } })
    .lean()
    .exec();
}

async function search(query, limit) {
  return NewsModel.find(
    {
      $text: { $search: query, $caseSensitive: false },
      isPublished: true,
    },
    {
      similarity: { $meta: "textScore" },
    }
  )
    .select("-content")
    .limit(limit)
    .sort({ similarity: { $meta: "textScore" } })
    .lean()
    .exec();
}

async function searchLike(query, limit) {
  return NewsModel.find({
    title: { $regex: `.*${query}.*`, $options: "i" },
    isPublished: true,
  })
    .select("-content")
    .limit(limit)
    .sort({ score: -1 })
    .lean()
    .exec();
}

export default {
  create,
  update,
  findInfoById,
  findInfoForPublishedById,
  findPublishedById,
  findNewsAllDataById,
  findByTagAndPaginated,
  findAllPublishedForAuthor,
  findAllPublished,
  findLatestNews,
  findDetailedNews,
  searchSimilarNews,
  search,
  searchLike,
};
