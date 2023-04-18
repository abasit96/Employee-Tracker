const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table")

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1010",
    database: "employee_tracker_db"
})

const addEmployee = async () => {
    await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the name of the new employee?"
        }
    ])
        .then(answers => {
            db.query(`INSERT INTO employee (name) VALUES ("${answers.name}");`, (err, result) => {
                console.log("Employee added!");
            })
        })
}

const mainMenu = async () => {
    let answer = await inquirer.prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Exit"]
    })

    while (answer.choice !== 'Exit') {
        // VIEW ALL EMPLOYEES
        if (answer.choice == "View All Employees") {
            await viewAllEmployees();
        }
        // ADD EMPLOYEE
        if (answer.choice == "Add Employee") {
            await addEmployee();
        }
        // UPDATE EMPLOYEE ROLE
        // TODO

        // VIEW ALL ROLES
        if (answer.choice == "View All Roles") {
            await viewAllRoles();
        }

        // ADD ROLE
        if (answer.choice == "Add Role") {
            addRole();
        }

        // VIEW ALL DEPARTMENTS
        if (answer.choice == "View All Departments") {
            await viewAllDepartments();
        }

        // ADD DEPARTMENT
        if (answer.choice == "Add Department") {
            await addDepartment();
        }

        console.log('\n')
        answer = await inquirer.prompt({
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Exit"]
        })
    }

}

// SELECT * FROM employee INNER JOIN managers ON employee.manager_id === managers.id;
// Roles.findAll({ include: Departments })

const viewAllEmployees = async () => {
    await db.promise().query("SELECT employee.id, employee.first_name, employee.last_name, role.title as 'Job Title', department.name as Department, role.salary as Salary, employee.manager_id FROM employee INNER JOIN (role INNER JOIN department ON role.department_id = department.id) ON employee.role_id = role.id;").then(([result, err]) => {
        console.log('\n');
        console.log(result)
        const _result = result.map((emp) => {
            if (emp.manager) {
                result.find()
            }
        })
        console.table(result);
    })
    return;
}

const viewAllRoles = async () => {
    await db.promise().query("SELECT role.title as 'Job Title', role.id as 'Role Id', department.name as Department, role.salary as Salary FROM role INNER JOIN department ON role.department_id = department.id;").then(([result, err]) => {
        console.log('\n');
        console.table(result);
    })
    return;
}

const viewAllDepartments = async () => {
    db.query("SELECT * FROM department;", (err, result) => {
        console.log('\n');
        console.table(result);
    })
    return;
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
            })
        })
}

const addRole = () => {
    const Departments = db.query("SELECT id, name FROM department");

    inquirer.prompt([
        {
            name: "role",
            type: "input",
            message: "Enter new role"
        },
        {
            name: "salary",
            type: "input",
            message: "Enter this role's salary"
        },
        {
            name: "department",
            type: "list",
            message: "Select which department this role is in",
            choices: Departments,
        }
    ]).then(response => {
        const departmentId = departmentNames[response.department];
        const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)' [response.role, response.salary, departmentId];
        db.query(sql, (err, res) => {
          if (err) {
            console.error(err.message);
            return;
          }
          console.log('Role has been added.');
          init();
        });
      });
    }



mainMenu();