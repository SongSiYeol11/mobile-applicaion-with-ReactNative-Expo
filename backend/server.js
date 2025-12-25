import express from "express"
import dotenv from "dotenv"
import { sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

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

app.get("/api/transactions/:userId",async(req,res) =>{
  try {
    const {userId} = req.params
    const transactions =await sql`
      SELECT * FROM transaction WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    res.status(200).json(transactions)
  } catch (error) {
      console.log("Error getting creating the transaction",error)
      res.status(500).json({message:"internal server Error"})
  }
})

// "/api/transactions"  거래 내역 생성 ,입출금 기록 추가,결제 정보 저장
// async (req, res) => {} req:클라이언트가 서버로 보낸 정보
//                        res:서버가 클라이언트에게 보내는 응답
//                        async: DB 저장, DB 조회, 외부 API 호출
app.post("/api/transactions",async(req,res) =>{
      // title, amount, category , user_id
      try {
        const{title, amount, category,user_id} = req.body
        
        if(!title || !user_id || !category || !amount === undefined){
          return res.status(400).json({message:"ALL fields are required"})
        }

        //RETURNING * 추가된 데이터를 즉시 확인
        await sql`
          INSERT INTO transactions(user_id,title, amount, category)
          VALUES (${user_id},${title},${amount},${category})
          RETURNING * 

    
          `
//  console.log(transaction)
// {
//   "id": 12,
//   "user_id": "abc123",
//   "title": "점심",
//   "amount": 9000,
//   "category": "food",
//   "created_at": "2025-12-23"
// }
        
        console.log(transaction)
        //한 행씩 가져오기 때문에 
        res.status(201).json(transaction[0])
      } catch (error) {
        console.log("Error creating the transaction",error)
        res.status(500).json({message:"internal server Error"})
      }
  });

app.delete("/api/transaction/:id",async(req,res) => {
  try {
    const {id} = req.params;
    
    if(isNaN(parseInt(id))){
      return res.status(400).json({message: "Invalid transaction ID"})
    }

    const result = await sql`
      DELETE FROM transactions WHERE id = ${id} RETURNING *
    `

    if(result.length === 0){
      return res.status(404).json({message:"Transaction not found"})
    }

    res.status(200).json({message:"Transaction deleted successfully"})
  } catch (error) {
      console.log("Error deleting the transaction",error)
      res.status(500).json({message:"internal server Error"})
  }
})

app.get("/api/transactions/summary/:userId",async(req,res)=>{
  try {
    const {userId} = req.params;
    const balanceResult = await sql`
        SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${userId}

    `
    const incomeResult = await sql`
         SELECT COALESCE(SUM(amount),0)  as income FROM transactions
         WHERE user_id = ${userId} AND amount > 0
    `
     const expensesResult = await sql`
         SELECT COALESCE(SUM(amount),0)  as expenses FROM transactions
         WHERE user_id = ${userId} AND amount < 0
    `

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    })




    // income + exppense - amount > 0  or amount < 0
  } catch (error) {
    console.log("Error getting the summary",error)
    res.status(500).json({message:"internal server Error"})
  }
})
//DB 연결 성공을 보장하기 위해서 이함수를 씀
//then()은 DB에 연동이 되야지만 실행이 된다.
initDB().then(() =>{
  app.listen(PORT,"0.0.0.0",() => {
        console.log("Server is up and running on PORT:",PORT);
    }); 

})
