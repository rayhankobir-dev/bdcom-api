import { Server } from "socket.io";
import { corsConfig } from "../../config.js";
import JWT from "../../core/JWT.js";
import User from "./user.service.js";
import { AuthFailureError } from "../../core/ApiError.js";
import keyService from "./key.service.js";
import { getCpuUsage, getRamUsage } from "../../helpers/utils.js";

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: { corsConfig },
    maxHttpBufferSize: 1e8,
  });

  // make authentication
  io.use(authenticateToken);
  io.setMaxListeners(2);

  io.on("connection", async (client) => {
    // console.log(cpuAverage());
    const emitStats = setInterval(() => {
      client.emit("stats", {
        cpu: getCpuUsage(),
        ram: getRamUsage(),
      });
    }, 1000);

    client.on("disconnect", () => {
      clearInterval(emitStats);
    });
  });
}

async function authenticateToken(socket, next) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new AuthFailureError("Authentication token is missing"));
  }

  try {
    const payload = await JWT.validate(token);
    const user = await User.findById(payload.sub);

    if (!user) return next(new AuthFailureError("User not registered"));
    socket.user = user;
    return next();
  } catch (error) {
    next(error);
  }
}
