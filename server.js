const express = require("express")
const app = express()
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")

// Inställningar av servern.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function getDBConnnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restapi",
  })
}

app.get("/", (req, res) => {
    res.send(`
      
      <h1> Dokumentation </h1>
      <br>
      <p> GET /users | Ger alla användare i databasen.</p>
      <p> GET /users/:id | Ger den specifika användaren som specifieras med id-siffran. </p>
      <p> POST /users | Skapar en ny användare i databasen baserad på information i <br>
      JSON-format som skickats in. Lösenordet blir hashat samt får salt för säker lagring. </p>
      <p> PUT /users | Uppdaterar all information om en användare med specifikt id <br> 
      för att sedan returnera de nya username och name tillbaka till klienten.</p>
      <p> POST /login | </p>
 

      
      `)
})

app.get("/users", async function (req, res) {

  let connection = await getDBConnnection()
  let sql = `SELECT * FROM users`   
  let [results] = await connection.execute(sql)
  res.json(results)

});

app.get('/users/:id', async function(req, res) {

  let connection = await getDBConnnection()
  let sql = "SELECT * FROM users WHERE id = ?"
  let [results] = await connection.execute(sql, [req.params.id])
  res.json(results[0]) 

});


app.post('/users', async function(req, res) {
 
  let connection = await getDBConnnection()
  let sql1 = `INSERT INTO users (username, name, password, salt)
  VALUES (?, ?, ?, ?)`

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt); 

  if (req.body && req.body.username && req.body.name && req.body.password && salt) {
    let [results] = await connection.execute(sql1, [
      req.body.username,
      req.body.name,
      hashedPassword,
      salt
    ])
    
  res.json(results)
  }
  
  else {
 
    res.sendStatus(422)
  }
});

app.put("/users/:id", async function (req, res) {

  let connection = await getDBConnnection()
  let sql = `
    UPDATE users
    SET username = ?, name = ?, password = ?, salt = ?
    WHERE id = ?
    `
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt); 

  let [results] = await connection.execute(sql, [
    req.body.username,
    req.body.name,
    hashedPassword,
    salt,
    req.params.id
  ])
  
  let sql2 = "SELECT username, name FROM users WHERE id = ?"
  let [result] = await connection.execute(sql2, [req.params.id])
  res.json(result[0])
})

app.post("/login", async function(req,res){

  let connection = await getDBConnnection()
  let sql = "SELECT * FROM users WHERE username = ?"
  let [results] = await connection.execute(sql, [req.body.username])

 


  const isPasswordValid = await bcrypt.compare(req.body.password, results.salt);

  if (isPasswordValid) {
    res.status(200)
    res.send("<p>Hallå, ditt riktiga namn är </p>", results.name)
  } 
  else {
    res.status(400).json({ error: "Wrong username or password!" });
  }


})

const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})