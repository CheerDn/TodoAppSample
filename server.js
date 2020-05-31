let express = require("express")
let mongodb = require("mongodb")
let sanitizeHTML = require("sanitize-html")

let app = express()
let db

let port = process.env.PORT
if (port == null || port == "") {
  prt = 3000
}

// make the folder available from the root of the server
app.use(express.static("public"))
let connectionString = "mongodb+srv://Stargazer:xmVG2A8jQlYdOfBT@cluster0-1c73x.gcp.mongodb.net/TodoApp?retryWrites=true&w=majority"

/*
  The option "useUnifiedTopology: true"
  is set to avoid the below warning while running node server.js

  DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, 
  and will be removed in a future version. To use the new Server Discover and 
  Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient 
  constructor.
*/
mongodb.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  db = client.db()
  app.listen(port)
})

// Tell express to take submitted form data and add it to the body object of request object.
app.use(express.urlencoded({ extended: false }))

// Tell express to wait for asynchronous requests, do the same thing above.
app.use(express.json())

function passwordProtected(req, res, next) {
  res.set("WWW-authenticate", 'Basic realm="Simple Todo App"')
  if (req.headers.authorization == "Basic SmltbXk6bm9kZWpz") {
    // tell express to run next function
    next()
  } else {
    res.status(401).send("Authentication required")
  }
}

// tell express to use the function for all routes
app.use(passwordProtected)

//main page
app.get("/", (req, res) => {
  //retrieve data from db before sending to client
  db.collection("items")
    .find()
    .toArray((err, items) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Simple To-Do App</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
          </head>
          <body>
            <div class="container">
              <h1 class="display-4 text-center py-1">To-Do App</h1>
              
              <div class="jumbotron p-3 shadow-sm">
                <form id="create-form" action="/create-item" method="POST">
                  <div class="d-flex align-items-center">
                    <input id="new-item-input" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                    <button id="new-item-btn" class="btn btn-primary">Add New Item</button>
                  </div>
                </form>
              </div>
              
              <ul id="item-list" class="list-group pb-5">

              </ul>
              
            </div>
            <script>
            let items = ${JSON.stringify(items)}
            </script>
            <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
            <script src="/browser.js"></script>
          </body>
        </html>
      `)
    })
})

// receive data of the new item
app.post("/create-item", (req, res) => {
  // prevent empty content on server side
  if (req.body.text) {
    //prevent malicious post by allowing no html tags and attributes
    let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
    db.collection("items").insertOne({ text: safeText }, (err, info) => {
      //jsonify newly inserted item and response to client
      res.json(info.ops[0])
    })
  } else {
    res.send("Input is empty! Are you using Postman or something?")
  }
})

// receive update text content
app.post("/update-item", (req, res) => {
  if (req.body.text) {
    let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
    db.collection("items").findOneAndUpdate({ _id: new mongodb.ObjectID(req.body.id) }, { $set: { text: safeText } }, () => {
      res.send("Success")
    })
  } else {
    res.send("Input is empty! Are you using Postman or something?")
  }
})

app.post("/delete-item", (req, res) => {
  db.collection("items").deleteOne({ _id: new mongodb.ObjectID(req.body.id) }, () => {
    res.send("Success")
  })
})
