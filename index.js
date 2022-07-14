const inquirer = require("inquirer");
const { connection } = require("./db/connection");
const ctable = require("console.table");

function tableView(tableName) {
    let query = "SELECT * FROM " + tableName;
    console.log(query)
    connection.query(query, function (err, res) {
        if (err) {
            throw err
        }
        console.table(res);
        runEmployeeView();
    }
    )
}

function addEmployee() {
    let query = `SELECT r.id AS 'Role Id', title AS Title, CONCAT(first_name," ",last_name) AS Name, e.id AS 'Id #'
    FROM role r
    LEFT JOIN employee e
    ON e.role_id = r.id;`;

    connection.query(query, (err, res) => {
        if (err) {
            throw err
        }

        console.table(res);
    })

    inquirer
        .prompt([
            {
                name: "isManager",
                type: "confirm",
                message: "Is the Employee a Manager?",
            },
            {
                name: "employeeFirstName",
                type: "input",
                message: "What is the Emplooyee's First Name?"
            },
            {
                name: "employeeLastName",
                type: "input",
                message: "What is the Emplooyee's Last Name?"
            },
            {
                name: "employeeRoleID",
                type: "input",
                message: "what is the Employee's Role ID?"
            },
            {
                name: "managerId",
                type: "input",
                message: "What is the Manager's ID?",
                when: (answer) => {
                    return answer.isManager === false
                }
            },
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.employeeFirstName,
                    last_name: answer.employeeLastName,
                    role_id: answer.employeeRoleID,
                    manager_id: answer.managerId,
                },
                function (err) {
                    if (err) {
                        throw err;
                    } else {
                        let query = `SELECT r.id AS 'Role Id', title AS Title, CONCAT(first_name," ",last_name) AS Name, e.id AS 'Id #'
                      FROM role r
                      LEFT JOIN employee e
                      ON e.role_id = r.id;`;
                        connection.query(query, function (err, res) {
                            if (err) throw err;
                            {
                                console.table(res);
                            }
                            runEmployeeView();
                        });
                    }
                }
            )
        })
}

function addRole() {
    connection.query(
        `SELECT department.id AS "Dept ID", department.name AS "Dept Name", title AS "Role Title", salary, department_id AS "Role Table Department ID"
    FROM department
    LEFT JOIN role r 
    ON department.id = department_id;`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
        }
    );
    inquirer
        .prompt([
            {
                name: "roleTitle",
                type: "input",
                message: "What is the role title",
            },

            {
                name: "roleSalary",
                type: "input",
                message: "What is the role's salary",
            },
            {
                name: "departmentId",
                type: "input",
                message: "What is the role's department id?",
            },
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: answer.roleTitle,
                    salary: answer.roleSalary,
                    department_id: answer.departmentId,
                },
                function (err) {
                    if (err) {
                        throw err;
                    } else {
                        let query = `SELECT * FROM role`;
                        connection.query(query, function (err, res) {
                            if (err) throw err;
                            {
                                console.table(res);
                            }
                            runEmployeeView();
                        });
                    }
                }
            );
        });
}

function addDepartment() {
    connection.query(`SELECT * FROM department`, (err, res) => {
        if (err) throw err;
        console.table(res);
    });

    inquirer
        .prompt([
            {
                name: "departmentName",
                type: "input",
                message: "What is the department name?",
            },
        ])
        .then((answer) => {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    name: answer.departmentName,
                },
                function (err) {
                    if (err) {
                        throw err;
                    } else {
                        let query = "SELECT * FROM department";
                        connection.query(query, function (err, res) {
                            if (err) throw err;
                            {
                                console.table(res);
                            }
                            runEmployeeView();
                        });
                    }
                }
            );
        });
}

function updateEmployeeRole() {
    connection.query(
        `SELECT r.id AS 'Role Id', title AS Title, CONCAT(first_name," ",last_name) AS Name, e.id AS 'Id #'
      FROM role r
      LEFT JOIN employee e
      ON e.role_id = r.id;`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
        }
    );

    inquirer
        .prompt([
            {
                name: "employeeID",
                type: "input",
                message: "What is the employee's id?",
            },

            {
                name: "updateEmployeeRole",
                type: "input",
                message: "What is the employee's new role id?",
            },
        ])
        .then((answer) => {
            connection.query(
                `UPDATE employee SET role_id  = ${answer.updateEmployeeRole}
           WHERE id = ${answer.employeeID};`,
                (err) => {
                    if (err) {
                        throw err;
                    } else {
                        connection.query(
                            `SELECT r.id AS 'Role Id', title AS Title, CONCAT(first_name," ",last_name) AS Name, e.id AS 'Id #'
                  FROM role r
                  LEFT JOIN employee e
                  ON e.role_id = r.id;`,
                            (err, res) => {
                                if (err) throw err;
                                console.table(res);
                                runEmployeeView();
                            }
                        );
                    }
                }
            );
        });
}

function runEmployeeView() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "View All Departments",
                "View All Roles",
                "Add Employee",
                "Add Role",
                "Add Department",
                "Update Employee Role",
                "Quit",
            ]

        })
        .then((res) => {
            switch (res.action) {
                case "View All Employees":
                    tableView("employee");
                    break;

                case "View All Departments":
                    tableView("department");
                    break;

                case "View All Roles":
                    tableView("role");
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Department":
                    addDepartment();
                    break;

                case "Update Employee Role":
                    update
                    EmployeeRole();
                    break;

                case "Quit":
                    connection.end();
                    break
            }
        })
}


runEmployeeView();
