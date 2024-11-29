const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 666;

let myVariable = 1;
let incidentNumber = "";

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
    res.render("incidentCreate.ejs", { incidentNumber });
  });
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
