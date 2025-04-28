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
    res.send(`<h1>EXEMPEL</h1>
    <ul><li> GET /users</li></ul>`)
})

app.post('/users', async function(req, res) {
  console.log(req.body)
 
  let connection = await getDBConnnection()
  let sql1 = `INSERT INTO users (username, name, password, salt)
  VALUES (?, ?, ?, ?)`
  console.log("test");

  const salt = await bcrypt.genSalt(10);  // genererar ett salt till hashning
  const hashedPassword = await bcrypt.hash(req.body.password, salt); //hashar lösenordet


  //gör det i del2
  

  if (req.body && req.body.username) {
    let [results] = await connection.execute(sql1, [
      req.body.username,
      req.body.name,
      hashedPassword,
      salt,
    ])
    console.log(results)
  res.json(results)
  }
  
  else {
    //returnera med felkod 422 Unprocessable entity.
    //eller 400 Bad Request.
    res.sendStatus(422)
  }
});

app.put("/users/:id", async function (req, res) {
  //kod här för att hantera anrop…
  let sql = `UPDATE users
    SET name = ?, password = ?,
    WHERE id = ?`

  let [results] = await connection.execute(sql, [
    req.body.first_name,
    req.body.last_name,
    req.params.id,
  ])
  //kod här för att returnera data
})

app.get("/login", function(req,res){

  let payload = {
    sub: user.id,         // sub är obligatorisk
    username: user.name,
  

    // kan innehålla ytterligare attribut, t.ex. roller
  }
  let token = jwt.sign(payload, 'generic payload');

})

app.get("/auth-test", function (req, res) {
  let authHeader = req.headers["authorization"] //Hämtar värdet (en sträng med token) från authorization headern i requesten
  
  if (authHeader === undefined) {
    res.status(401).send("Auth token missing.")
  }
  
  let token = authHeader.slice(7) // Tar bort "BEARER " som står i början på strängen.
  console.log("token: ", token)

  let decoded
  try {
    // Verifiera att detta är en korrekt token. Den ska vara:
    // * skapad med samma secret
    // * omodifierad
    // * fortfarande giltig
    decoded = jwt.verify(token, THESECRET)
  } catch (err) {
    // Om något är fel med token så kastas ett error.

    console.error(err) //Logga felet, för felsökning på servern.

    res.status(401).send("Invalid auth token")
  }

  res.send(decoded) // Skickar tillbaka den avkodade, giltiga, tokenen.
})
  
const port = 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})