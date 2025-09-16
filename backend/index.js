import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(
    "<H1>guru bharma guru vishnu guru devo maheshwara ha gurusakshath parabhrama tashmai shree gurave namah.</H1>"
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
