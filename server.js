const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table")

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1010",
    database: "employee_tracker_db"
})


const mainMenu = () => {
    inquirer.prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Exit"]
    })
        .then(answer => {
            // VIEW ALL EMPLOYEES
            if (answer.choice == "View All Employees") {
                viewAllEmployees();
            }
            // ADD EMPLOYEE

            // UPDATE EMPLOYEE ROLE

            // VIEW ALL ROLES
            if (answer.choice == "View All Roles") {
                viewAllRoles();
            }
            // ADD ROLE

            // VIEW ALL DEPARTMENTS
            if (answer.choice == "View All Departments") {
                viewAllDepartments();
            }
            // ADD DEPARTMENT
            if (answer.choice == "Add Department") {
                addDepartment();
            }

            if(answer.choice == "Exit") {
                console.log("Goodbye!")
                process.exit(1);
            }
        })
}

const viewAllEmployees = () => {
    db.query("SELECT * FROM employee;", (err, result) => {
        console.table(result);
        mainMenu();
    })
}

const viewAllRoles = () => {
    db.query("SELECT * FROM role;", (err, result) => {
        console.table(result);
        mainMenu();
    })
}

const viewAllDepartments = () => {
    db.query("SELECT * FROM department;", (err, result) => {
        console.table(result);
        mainMenu();
    })
}

const addDepartment = () => {
    inquirer.prompt([
        // {
        //     type: "input",
        //     name: "id",
        //     message: "What is the id of the new department?"
        // },
        {
            type: "input",
            name: "name",
            message: "What is the name of the new department?"
        }
    ])
        .then(answers => {
            db.query(`INSERT INTO department (name) VALUES ("${answers.name}");`, (err, result) => {
                console.log("Department added!");
                mainMenu();
            })
        })
}



mainMenu();