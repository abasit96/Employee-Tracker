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

const mainMenu = async () => {
    let answer = await inquirer.prompt({
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Update Employee Role", "Exit"]
    })

    // while (answer.choice !== 'Exit') {
    // VIEW ALL EMPLOYEES
    if (answer.choice == "View All Employees") {
        await viewAllEmployees();
    }
    // ADD EMPLOYEE
    if (answer.choice == "Add Employee") {
        await addEmployee();
    }
    // UPDATE EMPLOYEE ROLE
    if (answer.choice == "Update Employee Role") {
        await updateEmployee();
    }

    // VIEW ALL ROLES
    if (answer.choice == "View All Roles") {
        await viewAllRoles();
    }

    // ADD ROLE
    if (answer.choice == "Add Role") {
        await addRole();
    }

    // VIEW ALL DEPARTMENTS
    if (answer.choice == "View All Departments") {
        await viewAllDepartments();
    }

    // ADD DEPARTMENT
    if (answer.choice == "Add Department") {
        await addDepartment();
    }
    // REMOVE DEPARTMENT
    if (answer.choice == "Remove Department"){
        await removeDepartment();
    }

    console.log('\n')
    // answer = await inquirer.prompt({
    //     type: "list",
    //     name: "choice",
    //     message: "What would you like to do?",
    //     choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Exit"]
    // })
    // }

}

// SELECT * FROM employee INNER JOIN managers ON employee.manager_id === managers.id;
// Roles.findAll({ include: Departments })

const viewAllEmployees = async () => {
    await db.promise().query("SELECT employee.id, employee.first_name, employee.last_name, role.title as 'Job Title', department.name as Department, role.salary as Salary, manager.first_name AS manager_name, manager.last_name AS manager_lname FROM employee INNER JOIN (role INNER JOIN department ON role.department_id = department.id) ON employee.role_id = role.id JOIN employee AS manager ON employee.manager_id = manager.id;").then(([result, err]) => {
        console.log('\n');
        console.log(result)
        const _result = result.map((emp) => {
            if (emp.manager) {
                result.find()
            }
        })
        console.table(result);
        mainMenu()
    })
    return;
}

const viewAllRoles = async () => {
    await db.promise().query("SELECT role.title as 'Job Title', role.id as 'Role Id', department.name as Department, role.salary as Salary FROM role INNER JOIN department ON role.department_id = department.id;").then(([result, err]) => {
        console.log('\n');
        console.table(result);
        mainMenu();
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
const removeDepartment = async () => {
    const [allDepartments] = await db.promise().query("SELECT * FROM department");

    const departmentChoices = allDepartments.map(dept => {
        return {
            name: dept.name,
            value: dept.id
        }
    })

    await inquirer.prompt({
        type: "list",
        name: "department_id",
        message: "Which department do you want to remove?",
        choices: departmentChoices
    })
    .then(answers => {
        const sql = 'DELETE FROM department WHERE id = ?;'
        const values = [answers.department_id]
        db.query(sql, values, (err, result) => {
            console.log("Department removed!");
            mainMenu();
        })
    })
}

const addRole = async () => {
    const [Departments] = await db.promise().query("SELECT id, name FROM department");

    // console.log(Departments)

    const deptChoices = Departments.map(dept => {
        return {
            name: dept.name,
            value: dept.id
        }
    })

    // console.log(deptChoices)

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
        // console.log(response)
        // const departmentId = Departments[response.Departments];
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



mainMenu();