USE employee_tracker_db;

INSERT INTO department (name) VALUES 
    ("Engineering"),
    ("Human Resources");

INSERT INTO role (title, salary, department_id) VALUES
    ("Senior Engineer", 120000, 1),
    ("Junior Engineer", 80000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id ) VALUES
    ("John", "Smith", 1, null),
    ("Peter", "Parker", 1, null),
    ("Marry", "James", 1, null),
    ("Peter", "Parker", 2, 1);