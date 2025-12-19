import express from "express"
import dotnev from "dotenv"

dotnev.config()  // 여기서부터 다시하기 13:34
const app = express()

app.get("/",(req,res) =>{
    res.send("It's working")
})

app.listen(5001,"0.0.0.0",() => {
        console.log("Server is up and running on PORT:5001");
    }); 
