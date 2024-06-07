import { tokenInfo } from "../config.js";
import { AuthFailureError, InternalError } from "../core/ApiError.js";
import JWT from "../core/JWT.js";

export const getAccessToken = (authorization) => {
  if (!authorization) throw new AuthFailureError("Invalid Authorization");
  if (!authorization.startsWith("Bearer "))
    throw new AuthFailureError("Invalid Authorization");
  return authorization.split(" ")[1];
};

export const validateTokenData = (payload) => {
  if (
    !payload ||
    !payload.iss ||
    !payload.sub ||
    !payload.aud ||
    !payload.prm ||
    payload.iss !== tokenInfo.issuer ||
    payload.aud !== tokenInfo.audience ||
    !payload.sub
  )
    throw new AuthFailureError("Invalid access token");

  return true;
};

export const createTokens = async (user, accessTokenKey, refreshTokenKey) => {
  const accessToken = await JWT.encode(
    Object.assign(
      {},
      new JWT.JwtPayload(
        tokenInfo.issuer,
        tokenInfo.audience,
        user._id.toString(),
        accessTokenKey,
        tokenInfo.accessTokenValidity
      )
    )
  );

  if (!accessToken) throw new InternalError();

  const refreshToken = await JWT.encode(
    Object.assign(
      {},
      new JWT.JwtPayload(
        tokenInfo.issuer,
        tokenInfo.audience,
        user._id.toString(),
        refreshTokenKey,
        tokenInfo.refreshTokenValidity
      )
    )
  );

  if (!refreshToken) throw new InternalError();

  const tokens = {
    accessToken,
    refreshToken,
  };
  return tokens;
};
