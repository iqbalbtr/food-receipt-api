import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger"
import privateApi from "../routes/private-api";
import api from "../routes/public-api";
import errorHandlers from "../error";

const web = new Hono();


web.use(cors({
    origin: [
    ],
    credentials: true
}));
web.use(prettyJSON());
web.use(logger())

web.route("/", api)
web.route("/api", privateApi);


web.onError(errorHandlers)

export default web