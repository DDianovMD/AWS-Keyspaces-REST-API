import "dotenv/config";
import express from "express";
import { client } from "./aws-keyspaces-connection/connection.js";
import cassandra from "cassandra-driver";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Get all
app.get("/employees", (req, res) => {
  const query = "SELECT * FROM employees.employee";

  const employees = [];

  client
    .execute(query)
    .then((result) => {
      for (const employee of result.rows) {
        const currentEmployee = {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          phone: employee.phone,
        };

        employees.push(currentEmployee);
      }

      console.log(`All employees are retrieved successfuly`)

      res.send(JSON.stringify(employees));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send();
    });
});

// Get by Id
app.get("/employees/:employeeId", (req, res) => {
  const query = `SELECT * FROM employees.employee WHERE id = ${req.params.employeeId}`;

  client
    .execute(query)
    .then((result) => {
      const employee = {
        id: result.rows[0].id,
        firstName: result.rows[0].firstName,
        lastName: result.rows[0].lastName,
        phone: result.rows[0].phone,
      };

      console.log(`Employee with ID ${req.params.employeeId} is retrieved successfully`);

      res.send(JSON.stringify(employee));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send();
    });
});

// Create
app.post("/employees", (req, res) => {
  const firstName = req.body[0].firstName;
  const lastName = req.body[0].lastName;
  const phone = req.body[0].phone;

  const query = `INSERT INTO employees.employee (id,"firstName","lastName",phone) VALUES (uuid(), '${firstName}', '${lastName}', '${phone}');`;

  client
    .execute(query, [], {
      consistency: cassandra.types.consistencies.localQuorum,
    })
    .then((result) => {
      console.log("Employee is inserted successfully");
      res.status(201).send();
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send();
    });
});

// Update
app.put("/employees/:employeeId", (req, res) => {
  const firstName = req.body[0].firstName;
  const lastName = req.body[0].lastName;
  const phone = req.body[0].phone;

  const query = `UPDATE employees.employee SET "firstName" = '${firstName}', "lastName" = '${lastName}', phone = '${phone}' WHERE id = ${req.params.employeeId}`;

  client
    .execute(query, [], {
      consistency: cassandra.types.consistencies.localQuorum,
    })
    .then((result) => {
      console.log("Employee is updated successfully");
      res.status(204).send();
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send();
    });
});

app.delete("/employees/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;

  const query = `DELETE FROM employees.employee WHERE id = ${employeeId}`;

  client
    .execute(query, [], {
        consistency: cassandra.types.consistencies.localQuorum,
      })
    .then((result) => {
      console.log(`Employee with ID ${employeeId} is deleted successfully`);
      res.status(200).send();
    })
    .catch((error) => {console.error(error); res.status(500).send()});
});

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
