import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import recipeRoutes from "./routes/recipes.js";
import tagRoutes from "./routes/tags.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = 8080;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/tags", tagRoutes);

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})