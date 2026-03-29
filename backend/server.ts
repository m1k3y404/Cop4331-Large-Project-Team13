import express from "express";
import cors from "cors";
import {} from "./schema.js";
import loginRoute from "./routes/login.js"

const app = express();

//db.connectDB()

app.use(cors());
app.use(express.json());


app.use('/api/users',loginRoute);
app.listen(5000);