// Step 1: Setup Express and Prisma
import express, { type Express, Request, Response } from "express";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import contactRoutes from "./routes/contact.routes";

const app: Express = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(express.json());

// Routes
app.use("/identify", contactRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send(
    "Hello World!\nPlease tell Dr. Emmett Brown that Bitespeed has reconciled his identity.\nWe got him!"
  );
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
