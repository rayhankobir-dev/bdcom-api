import Joi from "joi";

export default {
  newsId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  newsCreate: Joi.object().keys({
    title: Joi.string().required().min(10).max(500),
    content: Joi.string().min(10).required(),
    isPublished: Joi.boolean().optional().default(false),
  }),
  newsUpdate: Joi.object().keys({
    title: Joi.string().optional().min(10).max(500),
    content: Joi.string().min(10).optional(),
    isPublished: Joi.boolean().optional(),
  }),
  pagination: Joi.object().keys({
    page: Joi.number().required().integer().min(1),
    limit: Joi.number().required().integer().min(1),
  }),
};
