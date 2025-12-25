import express from "express"
import dotenv from "dotenv"
import { sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionRoute.js"
dotenv.config()   //.env 파일에 적힌 내용을 읽어서 process.env에 넣어주는 역할

const app = express()
//middleware => 중요한 점 : 중복 제거용 => 인증 검사, 토큰 확인, 요청시간 기록 , IP 확인, 요청 데이터 검증

app.use(rateLimiter);
app.use(express.json());


//our custom simple middleware
//next 는 자연스럽게 서버가 멈춘것 처럼 안보이게 하기 위함
app.use((req,res,next) =>{
  console.log("Hey we hit a req, the method is",req.method)
  next()
})
const PORT = process.env.PORT || 5001;

async function initDB() {  
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )`

      console.log("Database initalized successfully")
  } catch (error) {
    console.log("Error initalizing DB",error);
    process.exit(1) //status code 1 maenas falilure, 0 success
  }
}

//이 코드는 “서버가 잘 살아있다”는 걸 빠르게 확인하기 위한 테스트용 API다
app.get("/",(req,res) =>{
  res.send("its working")
})


app.use("/api/transactions",transactionsRoute)
//DB 연결 성공을 보장하기 위해서 이함수를 씀
//then()은 DB에 연동이 되야지만 실행이 된다.
initDB().then(() =>{
  app.listen(PORT,"0.0.0.0",() => {
        console.log("Server is up and running on PORT:",PORT);
    }); 

})
