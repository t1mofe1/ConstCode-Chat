import server from "./server.js";
import "./io.js";

const port = 3000;

server.listen(port, () => console.log(`listening on *:${port}`));
