const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 666;

let myVariable = 1;
let incidentNumber = "";

// this variable will get incident number when user search for one, and then
// this will be so that the user can edit the incident details in question.
let incidentNumberEdit = "";

const users = [
  { username: "admin", password: "lol12wego21", role: "admin" },
  { username: "user", password: "imnotadmin", role: "user" },
];

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

app.use(session({
  secret: 'put_some_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1 * 60 * 1000
  }
}));

app.post("/incident-login", function (req, res) {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  const pass = users.find((p) => p.password === password);
  if (user && pass) {
    req.session.user = user;
    console.log(`User ${username} logged in successfully!`);
    res.sendFile(__dirname + "/incidentPortal.html");
  } else {
    console.log("Invalid username or password");
    // Redirect back to the login page if login is unsuccessful.
    // Note this is a same file as "incidentPortal.html" but just contains error info which
    // states if password or username is wrong. I will see how can I show in the same page later.
    res.redirect("/index-incorrect-creds.html");
  }
});

app.get("/incident-create", function (req, res) {
  // This will redirect back to login page if session is no longer there.
  if (!req.session.user) {
    return res.redirect("/index.html");
  }
  incidentNumber = `INC${myVariable.toString().padStart(6, "0")}`;

  const filePath = "incidents.json";
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file", err);
      return res.status(500).send("Error reading file");
    }

    // To check if the incidentNumber already exists in the data or not.
    while (data.includes(incidentNumber)) {
      myVariable++;
      incidentNumber = `INC${myVariable.toString().padStart(6, "0")}`;
    }

    // Render the page after determining the correct incidentNumber.
    res.render("incidentCreate", { incidentNumber });
  });
});

app.get("/incident-edit", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/index.html");
  }
  var incNumber = incidentNumberEdit;
  const directoryPath = "D:/WebDev/IT Mgmt alt/";
  const fileName = "incidents.json";
  const filePath = path.join(directoryPath, fileName);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file: ", err);
        res.status(500).send("Error reading file");
        return;
      }
      const found = data.includes(incNumber);
      if (found) {
        const jsonData = JSON.parse(data);
        const incidentData = jsonData[incNumber];
        res.render("incidentEdit.ejs", { incidentData });
      } else {
        res.send("No incident found with ID: " + incNumber);
      }
    });
  } else {
    console.log("File not found:", filePath);
    res.status(404).send("File not found");
  }
});

app.get("/incident-edit-list", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/index.html");
  }
  var incNumber = req.query.incidentNumber;
  const directoryPath = "D:/WebDev/IT Mgmt alt/";
  const fileName = "incidents.json";
  const filePath = path.join(directoryPath, fileName);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file: ", err);
        res.status(500).send("Error reading file");
        return;
      }
      const found = data.includes(incNumber);
      if (found) {
        const jsonData = JSON.parse(data);
        const incidentData = jsonData[incNumber];
        res.render("incidentEdit.ejs", { incidentData });
      } else {
        res.send("No incident found with ID: " + incNumber);
      }
    });
  } else {
    console.log("File not found:", filePath);
    res.status(404).send("File not found");
  }
});

app.post("/incident-edit", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/index.html");
  }
  const incidentData = {
    incidentNumber: incidentNumberEdit,
    incidentCaller: req.body.incidentCaller,
    incidentAssignmentGroup: req.body.incidentAssignmentGroup,
    incidentShortDescription: req.body.incidentShortDescription,
    incidentWorkNotes: req.body.incidentWorkNotes,
  };

  const filePath = "incidents.json";
  fs.readFile(filePath, "utf8", (err, data) => {
    let jsonData = { INCIDENTS: {} };

    if (!err && data) {
      jsonData = JSON.parse(data);
    }
    console.log("jsonData" + jsonData);

    // Add the new incident to the INCIDENTS object.
    jsonData[incidentNumberEdit] = incidentData;
    console.log("jsonData[incidentNumber]" + jsonData[incidentNumber]);

    // Convert the updated JSON data to a formatted string.
    const updatedJson = JSON.stringify(jsonData, null, 2);
    console.log("updatedJson" + updatedJson);

    fs.writeFile(filePath, updatedJson, "utf8", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        res.status(500).send("Error processing form data");
      } else {
        console.log("Data written to file");
        res.send(
          "Incident has been updated successfully. <br> IT MGMT: <a href='http://localhost:666/index.html'>Click here</a>"
        );
      }
    });
  });
});

app.get("/incident-list", function (req, res) {
  var incNumber = incidentNumberEdit;
  const directoryPath = "D:/WebDev/IT Mgmt alt/";
  const fileName = "incidents.json";
  const filePath = path.join(directoryPath, fileName);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file: ", err);
        res.status(500).send("Error reading file");
        return;
      }
      const found = data.includes(incNumber);
      if (found) {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 5;
        incidentData = JSON.parse(data);
        const incidentEntries = Object.entries(incidentData).filter(
          ([key, value]) => key != "INCIDENTS"
        );
        const totalItems = incidentEntries.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const paginatedIncidents = incidentEntries.slice(startIndex, endIndex);

        if (page < 1) return res.redirect("/incident-list?page=1");
        if (page > totalPages)
          return res.redirect(`/incident-list?page=${totalPages}`);

        res.render("incidentList", {
          incidents: paginatedIncidents.map(([id, incident]) => ({
            id,
            ...incident,
          })),
          totalItems,
          totalPages,
          currentPage: page,
        });
      } else {
        res.send("No incident found with ID: " + incNumber);
      }
    });
  } else {
    console.log("File not found:", filePath);
    res.status(404).send("File not found");
  }
});

app.post("/incident-create", (req, res) => {
  // Just do the below when the incident number is not found, if found, only then increase the value.
  const incidentData = {
    incidentNumber: incidentNumber,
    incidentCaller: req.body.incidentCaller,
    incidentAssignmentGroup: req.body.incidentAssignmentGroup,
    incidentShortDescription: req.body.incidentShortDescription,
    incidentWorkNotes: req.body.incidentWorkNotes,
  };

  const filePath = "incidents.json";
  fs.readFile(filePath, "utf8", (err, data) => {
    let jsonData = { INCIDENTS: {} };

    if (!err && data) {
      jsonData = JSON.parse(data);
    }

    // Add the new incident to the INCIDENTS object.
    jsonData[incidentNumber] = incidentData;

    // Stringify the updated JSON data for a formatted string.
    const updatedJson = JSON.stringify(jsonData, null, 2);

    // Write the updated JSON data to the file.
    fs.writeFile(filePath, updatedJson, "utf8", (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        res.status(500).send("Error processing form data");
      } else {
        console.log("Data written to file");
        res.send(
          "Incident has been created successfully. <br> IT MGMT: <a href='http://localhost:666/index.html'>Click here</a>"
        );
      }
    });
  });
});

// Endpoint to check incident
app.post("/incident-search", function (req, res) {
  var incNumber = req.body.incNumberInput;
  incidentNumberEdit = incNumber;
  const directoryPath = "D:/WebDev/IT Mgmt alt/";
  const fileName = "incidents.json";
  const filePath = path.join(directoryPath, fileName);

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file: ", err);
        res.status(500).send("Error reading file");
        return;
      }
      const found = data.includes(incNumber);
      if (found) {
        const jsonData = JSON.parse(data);
        const incidentData = jsonData[incNumber];
        res.render("incidentFound", { incidentData });
      } else {
        res.send("No incident found with ID: " + incNumber);
      }
    });
  } else {
    console.log("File not found:", filePath);
    res.status(404).send("File not found");
  }
});

app.post("/incident-logout", function(req, res)
{
  req.session.destroy((err) => {
    if (err) {
        return res.status(500).send('Error while logging out');
    }
    res.redirect('/index.html');
});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
