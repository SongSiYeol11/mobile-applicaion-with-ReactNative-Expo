import express from "express"
import dotnev from "dotenv"
import { sql } from "./config/db.js";

dotnev.config()   //.env 파일에 적힌 내용을 읽어서 process.env에 넣어주는 역할

const app = express()
const PORT = process.env.PORT || 5001;

async function initDB() {  // 여기서 부터 다시 : 23:52
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `;
  } catch (error) {
    console.error(error);
  }
}

app.get("/",(req,res) =>{
    res.send("It's working")
})

console.log("my port:",process.env.PORT);
app.listen(PORT,"0.0.0.0",() => {
        console.log("Server is up and running on PORT:",PORT);
    }); 
