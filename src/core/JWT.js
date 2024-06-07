import path from "path";
import { readFile } from "fs";
import jwt from "jsonwebtoken";
import { ApiError, BadTokenError, TokenExpiredError } from "./ApiError.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JwtPayload {
  constructor(issuer, audience, subject, param, validity) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
    this.prm = param;
  }
}

async function readPublicKey() {
  return new Promise((resolve, reject) => {
    readFile(
      path.join(__dirname, "../../keys/public.pem"),
      "utf8",
      (err, data) => (err ? reject(err) : resolve(data))
    );
  });
}

async function readPrivateKey() {
  return new Promise((resolve, reject) => {
    readFile(
      path.join(__dirname, "../../keys/private.pem"),
      "utf8",
      (err, data) => (err ? reject(err) : resolve(data))
    );
  });
}

async function encode(payload) {
  const cert = await readPrivateKey();
  if (!cert) {
    throw new ApiError("Token generation failure");
  }
  return new Promise((resolve, reject) => {
    jwt.sign(payload, cert, { algorithm: "RS256" }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

async function validate(token) {
  const cert = await readPublicKey();
  try {
    return await jwt.verify(token, cert);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new TokenExpiredError();
    } else {
      throw new BadTokenError();
    }
  }
}

async function decode(token) {
  const cert = await readPublicKey();
  try {
    return await jwt.verify(token, cert, { ignoreExpiration: true });
  } catch (err) {
    throw new BadTokenError();
  }
}

export default {
  encode,
  validate,
  decode,
  JwtPayload,
};
