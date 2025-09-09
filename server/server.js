import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = 8080;
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

app.post("/api/message", async (req, res) => {
    try {
        const { message } = req.body;
        const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: message,
        });
        res.json({ reply: response.text });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
})

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})