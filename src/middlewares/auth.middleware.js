import JWT from "../core/JWT.js";
import asyncHandler from "../helpers/asyncHandler.js";
import { AuthFailureError } from "../core/ApiError.js";
import { getAccessToken, validateTokenData } from "../helpers/authUtils.js";
import KeyService from "../database/services/key.service.js";
import User from "../database/services/user.service.js";

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AuthFailureError("Authorization header missing");
  }

  req.accessToken = getAccessToken(authHeader);

  const payload = await JWT.validate(req.accessToken);
  validateTokenData(payload);

  const user = await User.findById(payload.sub);
  if (!user) throw new AuthFailureError("User not registered");

  req.user = user;

  const key = await KeyService.findforKey(req.user, payload.prm);
  if (!key) throw new AuthFailureError("Invalid access token");

  req.keys = key;

  return next();
});

export default auth;
