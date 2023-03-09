require("dotenv").config();
require("./utils/Passport_Strategies");
const { conf } = require("./utils/YargsConfig");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const Handlebars = require("handlebars");
const MongoStore = require("connect-mongo");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerSpecs = swaggerJsDoc(require("./utils/SwaggerOptions"));
const { Server } = require("http");
const { socket } = require("./utils/SocketIO");
const { engine } = require("express-handlebars");
const { USER_FRONT } = require("./Routers/Router_USER");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const { API_PRODUCT, API_CART, API_AUTH, API_USER } = require("./Routers/Router_API");
const app = express();
const PORT = conf.port;
const HOST = conf.host;
const httpServer = new Server(app);
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: conf.expires,
});
socket(httpServer);

/* ============ MIDDLEWARES CONFIG ============ */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.use(express.static("public"));
app.engine(
    "hbs",
    engine({
        extname: "hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials",
        handlebars: allowInsecurePrototypeAccess(Handlebars),
    })
);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session({
        name: "session",
        store: sessionStore,
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: conf.expires,
        },
    })
);

/* ============ ROUTES ============ */
app.use("/api/doc", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
app.use("/api/carrito", API_CART);
app.use("/api/productos", API_PRODUCT);
app.use("/api/auth", API_AUTH);
app.use("/api/user", API_USER);
app.use("/", USER_FRONT);
app.use((req, res) => {
    res.status(404).send({
        error: -2,
        description: { route: req.url, method: req.method },
        status: "Route not found",
    });
});

/* ============ SERVER ============ */
const ExpressServer = httpServer.listen(PORT, HOST, () => {
    console.log(`Servidor iniciado en: ${HOST}:${PORT}`);
});

ExpressServer.on("error", (e) => console.log("Se ha generado un error: " + e));
