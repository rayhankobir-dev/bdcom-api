import { NewsModel } from "../models/news.model.js";

const AUTHOR_DETAIL = "name email";

async function create(news) {
  const createdBlog = await NewsModel.create(news);
  return createdBlog.toObject();
}

async function update(blog) {
  return NewsModel.findByIdAndUpdate(blog._id, blog, { new: true })
    .lean()
    .exec();
}

async function findInfoById(id) {
  return NewsModel.findOne({ _id: id, status: true })
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
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
  return BlogModel.find(query)
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
