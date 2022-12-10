import "./style/app.scss";
import App from "./App.svelte";
import { initRouter } from "./router/Routing";
import Planner from "./storage/planner";
import SocketServer from "./utils/socket";

initRouter();
Planner.init();
SocketServer.init();

const app = new App({
  target: document.getElementById("app"),
});

export default app;
