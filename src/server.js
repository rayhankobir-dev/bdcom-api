import { server } from "./app.js";
import { port } from "./config.js";
import Logger from "./core/Logger.js";

// listeing the server
server.listen(port, () => {
  Logger.info(`server running on port : ${port}`);
});
