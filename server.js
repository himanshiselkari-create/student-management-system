const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const DATA_FILE = path.join(__dirname, "students.json");


/* ================= MIDDLEWARE ================= */

app.use(cors());

app.use(express.json());


/* ================= READ DATA ================= */

function getStudents() {

  try {

    if (!fs.existsSync(DATA_FILE)) {

      fs.writeFileSync(
        DATA_FILE,
        "[]",
        "utf8"
      );

      return [];

    }

    const data = fs.readFileSync(
      DATA_FILE,
      "utf8"
    );

    if (!data.trim()) {
      return [];
    }

    const students = JSON.parse(data);

    if (!Array.isArray(students)) {
      return [];
    }

    return students;

  } catch (error) {

    console.error(
      "Error reading students.json:",
      error
    );

    return [];

  }

}


/* ================= SAVE DATA ================= */

function saveStudents(students) {

  try {

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        students,
        null,
        2
      ),
      "utf8"
    );

    return true;

  } catch (error) {

    console.error(
      "Error saving students.json:",
      error
    );

    return false;

  }

}


/* ================= GET ALL STUDENTS ================= */

app.get("/students", (req, res) => {

  try {

    const students = getStudents();

    res.json(students);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to load students"
    });

  }

});


/* ================= ADD STUDENT ================= */

app.post("/students", (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      course,
      status,
      enrollmentDate
    } = req.body;


    /* VALIDATION */

    if (
      !name ||
      !email ||
      !phone ||
      !course ||
      !enrollmentDate
    ) {

      return res.status(400).json({
        message: "All fields are required"
      });

    }


    const students = getStudents();


    /* CREATE STUDENT */

    const newStudent = {

      id: Date.now(),

      name: String(name).trim(),

      email: String(email).trim(),

      phone: String(phone).trim(),

      course: String(course).trim(),

      status:
        status || "Active",

      enrollmentDate:
        enrollmentDate

    };


    /* ADD */

    students.push(newStudent);


    /* SAVE */

    const saved =
      saveStudents(students);


    if (!saved) {

      return res.status(500).json({
        message:
          "Unable to save student"
      });

    }


    /* RESPONSE */

    res.status(201).json(
      newStudent
    );

  } catch (error) {

    console.error(
      "ADD STUDENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while adding student"
    });

  }

});


/* ================= UPDATE STUDENT ================= */

app.put("/students/:id", (req, res) => {

  try {

    const id =
      Number(req.params.id);


    const {
      name,
      email,
      phone,
      course,
      status,
      enrollmentDate
    } = req.body;


    /* VALIDATION */

    if (
      !name ||
      !email ||
      !phone ||
      !course ||
      !enrollmentDate
    ) {

      return res.status(400).json({
        message:
          "All fields are required"
      });

    }


    const students =
      getStudents();


    const index =
      students.findIndex(
        student =>
          Number(student.id) === id
      );


    if (index === -1) {

      return res.status(404).json({
        message:
          "Student not found"
      });

    }


    /* UPDATE */

    students[index] = {

      ...students[index],

      name: String(name).trim(),

      email: String(email).trim(),

      phone: String(phone).trim(),

      course: String(course).trim(),

      status:
        status || "Active",

      enrollmentDate:
        enrollmentDate

    };


    const saved =
      saveStudents(students);


    if (!saved) {

      return res.status(500).json({
        message:
          "Unable to update student"
      });

    }


    res.json(
      students[index]
    );

  } catch (error) {

    console.error(
      "UPDATE STUDENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating student"
    });

  }

});


/* ================= DELETE STUDENT ================= */

app.delete("/students/:id", (req, res) => {

  try {

    const id =
      Number(req.params.id);


    const students =
      getStudents();


    const index =
      students.findIndex(
        student =>
          Number(student.id) === id
      );


    if (index === -1) {

      return res.status(404).json({
        message:
          "Student not found"
      });

    }


    students.splice(
      index,
      1
    );


    const saved =
      saveStudents(students);


    if (!saved) {

      return res.status(500).json({
        message:
          "Unable to delete student"
      });

    }


    res.json({
      message:
        "Student deleted successfully"
    });

  } catch (error) {

    console.error(
      "DELETE STUDENT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting student"
    });

  }

});


/* ================= SERVER ================= */

app.listen(
  PORT,
  "127.0.0.1",
  () => {

    console.log(
      `Server running on http://127.0.0.1:${PORT}`
    );

  }
);