const express = require('express');
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require('bcrypt');

const jwt = require("jsonwebtoken")

const app = express();
app.use(express.json()) //*** this is important while working on post method because it regognize the json phrase and parses it
const dbPath = path.join(__dirname, "travel.db");
let db = null;

const initializeDbServer = async () => {
  try { // Added error handling
    db = await open({
      filename: dbPath, // Removed potential space after colon
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running in port 3000");
    });
  } catch (error) {
    console.error(error);
    // Handle initialization errors appropriately
  }
}

initializeDbServer();



app.get("/viewall/", async (request, response) => {
  const authHeader = request.headers["authorization"];
  
  if (!authHeader) {
      return response.status(401).send("Authorization header is missing.");
  }

  const tokenParts = authHeader.split(" ");
  
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer" || !tokenParts[1]) {
      return response.status(401).send("Invalid Access Token format.");
  }

  const jwtToken = tokenParts[1];

  try {
      const payload = jwt.verify(jwtToken, "MY_SECRET_TOKEN");
      try {
          const getQuery = "SELECT * FROM entries ;";
          const travelArray = await db.all(getQuery);
          response.send(travelArray);
      } catch (dbError) {
          console.error("Database error:", dbError);
          response.status(500).send("Failed to retrieve books.");
      }
  } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      response.status(401).send("Invalid Access Token");
  }
});


app.get("/viewall/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Add input validation for 'id' here

    const GetIdQuery = `select * from entries where id=${id}`;
    const ids = await db.get(GetIdQuery); // Assuming 'GetIdQuery' is the correct variable
    res.send(ids);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});


app.get("/balances/:id", async (req, res) => {
  try {
    const { id } = req.params;
    

    const GetIdQuery1 = `select * from balances where id=${id}`;
    const ids1 = await db.get(GetIdQuery1); // Assuming 'GetIdQuery1' is the correct variable
    res.send(ids1);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

app.get("/loanstatus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    

    const GetIdQuery2 = `select * from PersonLoanStatus where id=${id}`;
    const ids2 = await db.get(GetIdQuery2); // Assuming 'GetIdQuery1' is the correct variable
    res.send(ids2);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

app.post("/viewall",async(req,res)=>{
try{
  const dat = req.body
  const {id,title,destination,date,description,images} = dat
  const addDataQuery = `
  insert into entries(id,title,destination,date,description,images)
  values (
    ${id},
    "${title}",
    "${destination}",
    "${date}",
    "${description}",
    ${images}
  );
  `;

  const addQuery = await db.run(addDataQuery);
  res.send(addQuery)

  
}
catch(e){
  console.log(e);

  
}
});

app.delete("/viewall/:id", async (req,res) =>{
  try{
  const { id } = req.params;
  const deleteQuery = `Delete from entries where id = ${id}`;
  await db.run(deleteQuery);
  res.send("Deleted query");

  }
  catch(e){
    res.send(e);
  }
});

// Register user
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Prepare the query to check if the user already exists
    const selectUserQuery = `SELECT * FROM users WHERE username = ?`;
    const dbUser = await db.get(selectUserQuery, [username]);

    if (!dbUser) {
      // If the user does not exist, prepare and run the insert query
      const createUserQuery = `
        INSERT INTO users (username, name, password, gender, location)
        VALUES (?, ?, ?, ?, ?)
      `;
      const dbResponse = await db.run(createUserQuery, [username, name, hashedPassword, gender, location]);

      
      response.send(`Created new user with ID: ${dbResponse.lastID}`);
    } else {
      // If user exists, send an error response
      response.status(400).send("User already exists");
    }
  } catch (error) {
    response.status(500).send("Server error: " + error.message);
  }
});


app.post("/login", async (request, response) => {
  const { username, password } = request.body; 

  if (!username || !password) {
      
      return response.status(400).send("Username and password are required.");
  }

  try {
      const selectUserQuery = 'SELECT * FROM users WHERE username = ?'; // Using parameterized query
      const dbUser = await db.get(selectUserQuery, [username]); // Passing username safely

      if (!dbUser) {
          
          return response.status(400).send("Invalid User");
      }

      // Checking if the provided password matches the hashed password in the database
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched) {
          //generate token
          const payload = { username };
          const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN", { expiresIn: '1h' }); // Token expiration set to 1 hour

          return response.send({ jwtToken }); // Send the JWT token to the client
      } else {
          // If password does not match
          return response.status(400).send("Invalid Password");
      }
  } catch (error) {
      console.error('Error processing login:', error);
      return response.status(500).send("An error occurred while processing your request.");
  }
});
