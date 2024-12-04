const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 666;

let myVariable = 1;
let incidentNumber = "";

// this variable will get incident number when user search for one, and then
// this will be so that the user can edit the incident details in question.
let incidentNumberEdit = "";

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname))); // Serve static files

app.get("/incident-create", function (req, res) {
  incidentNumber = `INC${myVariable.toString().padStart(6, "0")}`;

  const filePath = "incidents.json";
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file", err);
      return res.status(500).send("Error reading file");
    }

    // Check if the incidentNumber already exists in the data
    while (data.includes(incidentNumber)) {
      myVariable++;
      incidentNumber = `INC${myVariable.toString().padStart(6, "0")}`;
    }

    // Render the page after determining the correct incidentNumber
    res.render("incidentCreate", { incidentNumber });
  });
});

app.get("/incident-edit", function(req, res) {
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

app.get("/incident-edit-list", function(req, res) {
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

app.post("/incident-edit", function(req, res) {
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
      jsonData = JSON.parse(data); // Parse existing data if it exists
    }
    console.log("jsonData" + jsonData);

    // Add the new incident to the INCIDENTS object
    jsonData[incidentNumberEdit] = incidentData;
    console.log("jsonData[incidentNumber]" + jsonData[incidentNumber]);

    // Convert the updated JSON data to a formatted string
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

app.get("/incident-list", function(req, res) {
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
        const incidentEntries = Object.entries(incidentData).filter(([key, value]) => key != "INCIDENTS");
        const totalItems = incidentEntries.length;
        const totalPages = Math.ceil(totalItems/pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const paginatedIncidents = incidentEntries.slice(startIndex, endIndex);
        
        if (page < 1) return res.redirect('/incident-list?page=1');
        if (page > totalPages) return res.redirect(`/incident-list?page=${totalPages}`);

        res.render('incidentList', {
          incidents: paginatedIncidents.map(([id, incident]) => ({ id, ...incident })),
          totalItems,
          totalPages,
          currentPage: page
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
      jsonData = JSON.parse(data); // Parse existing data if it exists
    }

    // Add the new incident to the INCIDENTS object
    jsonData[incidentNumber] = incidentData;

    // Convert the updated JSON data to a formatted string
    const updatedJson = JSON.stringify(jsonData, null, 2);

    // Write the updated JSON data to the file
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
