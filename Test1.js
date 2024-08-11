const express = require("express")
const app = express()
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
app.get("/",(req,res)=>{
    res.send("Hello World");
});


let db = null
const dbpath = path.join(__dirname,"travel.db")

const iniDB = async ()=>{
    try{
    db = await open({
        filename:dbpath,
        driver:sqlite3.Database
    });
    app.listen(3000,()=>{
        console.log("Server is running at port 3000.")
    });

    }
    catch(e){
        console.log(e);
    }
}
iniDB()

app.get("/viewall/",async (req,res)=>{
    const getquery111 = "SELECT * FROM entries;";
    const fulllist = await db.all(getquery111);
    res.send(fulllist); 
});