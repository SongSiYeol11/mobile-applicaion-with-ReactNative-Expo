import express from "express"
import {sql} from "../config/db.js"

const router = express.Router()


router.get("/:userId",async(req,res) =>{
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
router.post("/",async(req,res) =>{
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

router.delete("/:id",async(req,res) => {
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

router.get("/summary/:userId",async(req,res)=>{
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



export default router