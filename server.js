// Import necessary packages
const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();
require("console.table")

// The following code hides mysql username and password through Environment Viriables (dotenv) 
const db = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "employee_tracker_db"
});

// This is the Main Menu where users will be prompted to choose from the options listed in this function
const mainMenu = async () => {
    let answer = await inquirer.prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View All Departments", "View All Roles", "View All Employees", "Add a Department", "Add a Role", "Add an Employee", "Update an Employee Role", "Remove Department", "Remove Role", "Remove Employee", "Exit"]
    })
    // VIEW ALL EMPLOYEES
    if (answer.choice == "View All Employees") {
        await viewAllEmployees();
    }
    // ADD EMPLOYEE
    if (answer.choice == "Add an Employee") {
        await addEmployee();
    }
    // UPDATE EMPLOYEE ROLE
    if (answer.choice == "Update an Employee Role") {
        await updateEmployee();
    }
    // VIEW ALL ROLES
    if (answer.choice == "View All Roles") {
        await viewAllRoles();
    }
    // ADD ROLE
    if (answer.choice == "Add a Role") {
        await addRole();
    }
    // VIEW ALL DEPARTMENTS
    if (answer.choice == "View All Departments") {
        await viewAllDepartments();
    }
    // ADD DEPARTMENT
    if (answer.choice == "Add a Department") {
        await addDepartment();
    }
    // REMOVE DEPARTMENT
    if (answer.choice == "Remove Department") {
        await removeDepartment();
    }
    // REMOVE EMPLOYEE
    if (answer.choice == "Remove Employee") {
        await removeEmployee();
    }
    // REMOVE ROLE
    if (answer.choice == "Remove Role") {
        await removeRole();
    }
    console.log('\n')
}

// Function to view all departments
const viewAllDepartments = async () => {
    db.query("SELECT * FROM department;", (err, result) => {
        console.log('\n');
        console.table(result);
        mainMenu()
    })
}

// Function to view all roles
const viewAllRoles = async () => {
    await db.promise().query("SELECT role.title as 'Job Title', role.id as 'Role Id', department.name as Department, role.salary as Salary FROM role INNER JOIN department ON role.department_id = department.id;").then(([result, err]) => {
        console.log('\n');
        console.table(result);
    })
    mainMenu();
}

// Function to view all employees
const viewAllEmployees = async () => {
    await db.promise().query("SELECT employee.id, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title as 'Job Title', department.name as Department, role.salary as Salary, CONCAT(manager.first_name, '', manager.last_name) AS 'Manager Name' FROM employee INNER JOIN (role INNER JOIN department ON role.department_id = department.id) ON employee.role_id = role.id JOIN employee AS manager ON employee.manager_id = manager.id;").then(([result, err]) => {
        console.log('\n');
        const _result = result.map((emp) => {
            if (emp.manager) {
                result.find()
            }
        })
        console.table(result);
    })
    mainMenu()
}

// Function to add a department
const addDepartment = () => {
    inquirer.prompt([
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
            mainMenu()
        })
}

// Function to add a role
const addRole = async () => {
    const [Departments] = await db.promise().query("SELECT id, name FROM department");
    const deptChoices = Departments.map(dept => {
        return {
            name: dept.name,
            value: dept.id
        }
    })
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
            choices: deptChoices,
        }
    ]).then(response => {
        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`
        const values = [response.role, response.salary, response.department];
        db.query(sql, values, (err, res) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Role has been added.');
            mainMenu();
        });
    });
}

// Function to add an employee
const addEmployee = async () => {

    const [allRoles] = await db.promise().query("SELECT * FROM role;")

    const [allEmployees] = await db.promise().query("SELECT * FROM employee");

    const roleChoices = allRoles.map(role => {
        return {
            name: `${role.title} (${role.salary})`,
            value: role.id
        }
    })

    const managerChoices = allEmployees.map(emp => {
        return {
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }
    })

    await inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "What is the first name of the new employee?"
        },
        {
            type: "input",
            name: "last_name",
            message: "What is the last name of the new employee?"
        },
        {
            type: "list",
            name: "role_id",
            message: "What is the role of the new employee?",
            choices: roleChoices
        },
        {
            type: "list",
            name: "manager_id",
            message: "Who is the manager of the new employee?",
            choices: managerChoices
        }
    ])
        .then(answers => {
            const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);'
            const values = [
                answers.first_name,
                answers.last_name,
                answers.role_id,
                answers.manager_id
            ]
            db.query(sql, values, (err, result) => {
                console.log("Employee added!");
                mainMenu()
            })
        })
}

// Function to update an employee role
const updateEmployee = async () => {

    const [allRoles] = await db.promise().query("SELECT * FROM role;")

    const [allEmployees] = await db.promise().query("SELECT * FROM employee");

    const roleChoices = allRoles.map(role => {
        return {
            name: `${role.title} (${role.salary})`,
            value: role.id
        }
    })

    const employeeChoices = allEmployees.map(emp => {
        return {
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }
    })

    await inquirer.prompt([
        {
            type: "list",
            name: "employee_id",
            message: "Who is the employee to be updated?",
            choices: employeeChoices
        },
        {
            type: "list",
            name: "role_id",
            message: "What is the new role of the this employee?",
            choices: roleChoices
        }

    ])
        .then(answers => {
            const sql = 'UPDATE employee SET role_id = ? WHERE id = ?;'
            const values = [
                answers.role_id,
                answers.employee_id
            ]
            db.query(sql, values, (err, result) => {
                console.log("Employee updated!");
                mainMenu()
            })
        })
}

// Function to remove a department
const removeDepartment = async () => {
    const [allDepartments] = await db.promise().query("SELECT * FROM department");

    const departmentChoices = allDepartments.map(dept => {
        return {
            name: dept.name,
            value: dept.id
        }
    })

    await inquirer.prompt([
        {
            type: "list",
            name: "department_id",
            message: "Which department do you want to remove?",
            choices: departmentChoices
        }
    ])
        .then(answers => {
            const sql = 'DELETE FROM department WHERE id = ?;'
            const values = [
                answers.department_id
            ]
            db.query(sql, values, (err, result) => {
                console.log("Department removed!");
                mainMenu()
            })
        })
}

// Function to remove an employee
const removeEmployee = async () => {
    // Prompt the user to select the employee to be removed
    const [allEmployees] = await db.promise().query("SELECT * FROM employee");

    const employeeChoices = allEmployees.map((emp) => {
        return {
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
        };
    });

    const { employee_id } = await inquirer.prompt({
        type: "list",
        name: "employee_id",
        message: "Which employee do you want to remove?",
        choices: employeeChoices,
    });

    // Delete the employee record from the database
    const sql = "DELETE FROM employee WHERE id = ?";
    const values = [employee_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Employee ${employee_id} removed from the database.`);
            mainMenu();
        }
    });
};

// Function to remove a role
const removeRole = async () => {
    //Prompt the user to select the Role to be removed
    const [allRoles] = await db.promise().query("SELECT * FROM role");

    const roleChoices = allRoles.map((role) => {
        return {
            name: `${role.title} ${role.salary}`,
            value: role.id,
        };
    });

    const { role_id } = await inquirer.prompt({
        type: "list",
        name: "role_id",
        message: "Which role do you want to remove?",
        choices: roleChoices,
    });

    // Delete the role record from the database
    const sql = "DELETE FROM role WHERE id = ?";
    const values = [role_id];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Role ${role_id} removed from the database.`);
            mainMenu();
        }
    })
};



mainMenu();