const API = "http://127.0.0.1:3000/students";

let studentsData = [];
let editingId = null;
let deletingId = null;

let currentPage = 1;
const rowsPerPage = 8;


/* ================= ELEMENTS ================= */

const studentList = document.getElementById("studentList");

const search = document.getElementById("search");

const courseFilter =
  document.getElementById("courseFilter");

const statusFilter =
  document.getElementById("statusFilter");

const totalStudents =
  document.getElementById("totalStudents");

const totalCourses =
  document.getElementById("totalCourses");

const activeStudents =
  document.getElementById("activeStudents");

const topCourse =
  document.getElementById("topCourse");

const studentModal =
  document.getElementById("studentModal");

const profileModal =
  document.getElementById("profileModal");

const deleteModal =
  document.getElementById("deleteModal");

const studentForm =
  document.getElementById("studentForm");

const nameInput =
  document.getElementById("name");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const courseInput =
  document.getElementById("course");

const statusInput =
  document.getElementById("status");

const enrollmentInput =
  document.getElementById("enrollmentDate");

const modalTitle =
  document.getElementById("modalTitle");

const modalSubtitle =
  document.getElementById("modalSubtitle");

const saveStudent =
  document.getElementById("saveStudent");

const emptyState =
  document.getElementById("emptyState");

const paginationInfo =
  document.getElementById("paginationInfo");

const paginationButtons =
  document.getElementById("paginationButtons");


/* ================= LOAD ================= */

document.addEventListener(
  "DOMContentLoaded",
  loadStudents
);


async function loadStudents() {

  try {

    const response =
      await fetch(API);

    if (!response.ok) {
      throw new Error();
    }

    studentsData =
      await response.json();

    updateDashboard();

    updateCourseFilter();

    applyFilters();

  } catch (error) {

    console.error(error);

    showToast(
      "Connection Error",
      "Please make sure your Node.js server is running.",
      true
    );

  }

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

  totalStudents.textContent =
    studentsData.length;


  const courses = [
    ...new Set(
      studentsData
        .map(student =>
          student.course?.trim()
        )
        .filter(Boolean)
    )
  ];


  totalCourses.textContent =
    courses.length;


  const active =
    studentsData.filter(
      student =>
        (student.status || "Active") === "Active"
    ).length;


  activeStudents.textContent =
    active;


  const counts = {};


  studentsData.forEach(student => {

    const course =
      student.course?.trim();

    if (!course) return;

    counts[course] =
      (counts[course] || 0) + 1;

  });


  let top = "-";

  let max = 0;


  Object.entries(counts).forEach(
    ([course, count]) => {

      if (count > max) {

        max = count;
        top = course;

      }

    }
  );


  topCourse.textContent =
    top;


  renderCourseStats(counts);

}


/* ================= DISPLAY ================= */

function getFilteredStudents() {

  const searchValue =
    search.value
      .toLowerCase()
      .trim();

  const selectedCourse =
    courseFilter.value;

  const selectedStatus =
    statusFilter.value;


  return studentsData.filter(student => {

    const text = `

      ${student.name || ""}

      ${student.email || ""}

      ${student.phone || ""}

      ${student.course || ""}

    `.toLowerCase();


    const matchesSearch =
      text.includes(searchValue);


    const matchesCourse =
      selectedCourse === "all" ||
      student.course === selectedCourse;


    const matchesStatus =
      selectedStatus === "all" ||
      (student.status || "Active") === selectedStatus;


    return (
      matchesSearch &&
      matchesCourse &&
      matchesStatus
    );

  });

}


function applyFilters() {

  const filtered =
    getFilteredStudents();


  const totalPages =
    Math.ceil(
      filtered.length / rowsPerPage
    );


  if (
    currentPage > totalPages &&
    totalPages > 0
  ) {
    currentPage = totalPages;
  }


  if (filtered.length === 0) {

    studentList.innerHTML = "";

    emptyState.style.display =
      "block";

    paginationInfo.textContent =
      "Showing 0 students";

    paginationButtons.innerHTML = "";

    return;

  }


  emptyState.style.display =
    "none";


  const start =
    (currentPage - 1) * rowsPerPage;

  const end =
    start + rowsPerPage;


  const pageData =
    filtered.slice(start, end);


  displayStudents(pageData);

  renderPagination(
    filtered.length,
    totalPages
  );

}


function displayStudents(data) {

  studentList.innerHTML = "";


  data.forEach(student => {

    const row =
      document.createElement("tr");


    const initials =
      getInitials(
        student.name || "Student"
      );


    const status =
      student.status || "Active";


    row.innerHTML = `

      <td>

        <div class="student-info">

          <div class="student-avatar">
            ${initials}
          </div>

          <div>
            <div class="student-name">
              ${escapeHTML(student.name || "-")}
            </div>
          </div>

        </div>

      </td>


      <td class="email">
        ${escapeHTML(student.email || "-")}
      </td>


      <td class="phone">
        ${escapeHTML(student.phone || "-")}
      </td>


      <td>

        <span class="course-badge">
          ${escapeHTML(student.course || "-")}
        </span>

      </td>


      <td class="date">
        ${formatDate(student.enrollmentDate)}
      </td>


      <td>

        <span class="status ${status.toLowerCase()}">
          ${status}
        </span>

      </td>


      <td>

        <div class="actions">

          <button
            class="action view"
            title="View Profile"
            onclick="viewStudent(${student.id})"
          >
            <i class="fa-regular fa-eye"></i>
          </button>


          <button
            class="action edit"
            title="Edit"
            onclick="editStudent(${student.id})"
          >
            <i class="fa-solid fa-pen"></i>
          </button>


          <button
            class="action delete"
            title="Delete"
            onclick="openDelete(${student.id})"
          >
            <i class="fa-solid fa-trash"></i>
          </button>

        </div>

      </td>

    `;


    studentList.appendChild(row);

  });

}


/* ================= ADD ================= */

document
  .getElementById("addStudentBtn")
  .addEventListener(
    "click",
    openAddModal
  );


document
  .getElementById("emptyAddBtn")
  .addEventListener(
    "click",
    openAddModal
  );


document
  .getElementById("quickAdd")
  .addEventListener(
    "click",
    openAddModal
  );


function openAddModal() {

  editingId = null;

  studentForm.reset();

  modalTitle.textContent =
    "Add New Student";

  modalSubtitle.textContent =
    "Enter student information.";

  saveStudent.innerHTML =
    '<i class="fa-solid fa-plus"></i> Add Student';


  enrollmentInput.value =
    new Date()
      .toISOString()
      .split("T")[0];


  statusInput.value =
    "Active";


  studentModal.classList.add("show");

  nameInput.focus();

}


/* ================= EDIT ================= */

function editStudent(id) {

  const student =
    studentsData.find(
      item =>
        Number(item.id) === Number(id)
    );


  if (!student) return;


  editingId = id;


  nameInput.value =
    student.name || "";

  emailInput.value =
    student.email || "";

  phoneInput.value =
    student.phone || "";

  courseInput.value =
    student.course || "";

  statusInput.value =
    student.status || "Active";

  enrollmentInput.value =
    student.enrollmentDate ||
    new Date()
      .toISOString()
      .split("T")[0];


  modalTitle.textContent =
    "Edit Student";

  modalSubtitle.textContent =
    "Update student information.";

  saveStudent.innerHTML =
    '<i class="fa-solid fa-floppy-disk"></i> Update Student';


  studentModal.classList.add("show");

}


/* ================= SAVE ================= */

studentForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const data = {

      name: nameInput.value.trim(),

      email: emailInput.value.trim(),

      phone: phoneInput.value.trim(),

      course: courseInput.value.trim(),

      status: statusInput.value,

      enrollmentDate:
        enrollmentInput.value

    };


    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.course ||
      !data.enrollmentDate
    ) {

      showToast(
        "Missing Information",
        "Please fill all fields.",
        true
      );

      return;

    }


    saveStudent.disabled =
      true;


    try {

      let response;


      if (editingId) {

        response =
          await fetch(
            `${API}/${editingId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(data)
            }
          );

      } else {

        response =
          await fetch(
            API,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(data)
            }
          );

      }


      if (!response.ok) {
        throw new Error();
      }


      closeStudentModal();


      showToast(
        editingId
          ? "Student Updated"
          : "Student Added",

        editingId
          ? "Student information updated successfully."
          : "New student added successfully."
      );


      await loadStudents();


    } catch (error) {

      console.error(error);

      showToast(
        "Error",
        "Unable to save student.",
        true
      );

    }


    saveStudent.disabled =
      false;

  }
);


/* ================= VIEW PROFILE ================= */

function viewStudent(id) {

  const student =
    studentsData.find(
      item =>
        Number(item.id) === Number(id)
    );


  if (!student) return;


  document.getElementById(
    "profileAvatar"
  ).textContent =
    getInitials(student.name);


  document.getElementById(
    "profileName"
  ).textContent =
    student.name;


  document.getElementById(
    "profileEmail"
  ).textContent =
    student.email;


  document.getElementById(
    "profilePhone"
  ).textContent =
    student.phone || "-";


  document.getElementById(
    "profileCourse"
  ).textContent =
    student.course;


  document.getElementById(
    "profileDate"
  ).textContent =
    formatDate(student.enrollmentDate);


  const profileStatus =
    document.getElementById(
      "profileStatus"
    );


  profileStatus.textContent =
    student.status || "Active";


  profileStatus.style.background =
    student.status === "Inactive"
      ? "#ffeded"
      : "#e7f8f0";


  profileStatus.style.color =
    student.status === "Inactive"
      ? "#ef4444"
      : "#16a36a";


  profileModal.classList.add("show");

}


/* ================= DELETE ================= */

function openDelete(id) {

  deletingId = id;

  deleteModal.classList.add("show");

}


document
  .getElementById("confirmDelete")
  .addEventListener(
    "click",
    async () => {

      if (!deletingId) return;


      try {

        const response =
          await fetch(
            `${API}/${deletingId}`,
            {
              method: "DELETE"
            }
          );


        if (!response.ok) {
          throw new Error();
        }


        deleteModal.classList.remove(
          "show"
        );


        showToast(
          "Student Deleted",
          "Student record deleted successfully."
        );


        deletingId = null;


        await loadStudents();


      } catch (error) {

        showToast(
          "Error",
          "Unable to delete student.",
          true
        );

      }

    }
  );


document
  .getElementById("cancelDelete")
  .addEventListener(
    "click",
    () => {

      deletingId = null;

      deleteModal.classList.remove(
        "show"
      );

    }
  );


/* ================= FILTERS ================= */

search.addEventListener(
  "input",
  () => {

    currentPage = 1;

    applyFilters();

  }
);


courseFilter.addEventListener(
  "change",
  () => {

    currentPage = 1;

    applyFilters();

  }
);


statusFilter.addEventListener(
  "change",
  () => {

    currentPage = 1;

    applyFilters();

  }
);


document
  .getElementById("resetFilters")
  .addEventListener(
    "click",
    () => {

      search.value = "";

      courseFilter.value = "all";

      statusFilter.value = "all";

      currentPage = 1;

      applyFilters();

    }
  );


/* ================= COURSE FILTER ================= */

function updateCourseFilter() {

  const current =
    courseFilter.value;


  const courses = [
    ...new Set(
      studentsData
        .map(
          student =>
            student.course?.trim()
        )
        .filter(Boolean)
    )
  ];


  courseFilter.innerHTML =
    `<option value="all">
      All Courses
    </option>`;


  courses
    .sort()
    .forEach(course => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        course;

      option.textContent =
        course;

      courseFilter.appendChild(
        option
      );

    });


  if (
    courses.includes(current)
  ) {

    courseFilter.value =
      current;

  }

}


/* ================= COURSE STATS ================= */

function renderCourseStats(counts) {

  const container =
    document.getElementById(
      "courseStats"
    );


  container.innerHTML = "";


  const entries =
    Object.entries(counts)
      .sort(
        (a,b) =>
          b[1] - a[1]
      );


  if (!entries.length) {

    container.innerHTML = `

      <p style="
        color:#888;
        font-size:10px;
      ">
        No course data available.
      </p>

    `;

    return;

  }


  const maximum =
    Math.max(
      ...entries.map(
        item => item[1]
      )
    );


  entries
    .slice(0, 6)
    .forEach(
      ([course,count]) => {

        const percentage =
          (count / maximum) * 100;


        const div =
          document.createElement(
            "div"
          );


        div.className =
          "course-item";


        div.innerHTML = `

          <div class="course-top">

            <span>
              ${escapeHTML(course)}
            </span>

            <strong>
              ${count}
            </strong>

          </div>


          <div class="progress">

            <div
              class="progress-bar"
              style="width:${percentage}%"
            ></div>

          </div>

        `;


        container.appendChild(
          div
        );

      }
    );

}


/* ================= PAGINATION ================= */

function renderPagination(
  total,
  totalPages
) {

  const start =
    (currentPage - 1)
    * rowsPerPage + 1;


  const end =
    Math.min(
      currentPage * rowsPerPage,
      total
    );


  paginationInfo.textContent =
    `Showing ${start}-${end} of ${total} students`;


  paginationButtons.innerHTML = "";


  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.className =
      "page-btn";


    if (i === currentPage) {
      button.classList.add(
        "active"
      );
    }


    button.textContent =
      i;


    button.addEventListener(
      "click",
      () => {

        currentPage = i;

        applyFilters();

      }
    );


    paginationButtons.appendChild(
      button
    );

  }

}


/* ================= EXPORT CSV ================= */

document
  .getElementById("exportBtn")
  .addEventListener(
    "click",
    exportCSV
  );


document
  .getElementById("quickExport")
  .addEventListener(
    "click",
    exportCSV
  );


function exportCSV() {

  if (!studentsData.length) {

    showToast(
      "No Data",
      "There are no students to export.",
      true
    );

    return;

  }


  const headers = [
    "Name",
    "Email",
    "Phone",
    "Course",
    "Status",
    "Enrollment Date"
  ];


  const rows =
    studentsData.map(
      student => [

        student.name || "",

        student.email || "",

        student.phone || "",

        student.course || "",

        student.status || "Active",

        student.enrollmentDate || ""

      ]
    );


  const csv = [
    headers,
    ...rows
  ]
    .map(
      row =>
        row
          .map(
            value =>
              `"${String(value)
                .replace(/"/g,'""')}"`
          )
          .join(",")
    )
    .join("\n");


  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href = url;

  link.download =
    "students.csv";


  link.click();


  URL.revokeObjectURL(url);


  showToast(
    "Export Complete",
    "Student data downloaded as CSV."
  );

}


/* ================= QUICK SEARCH ================= */

document
  .getElementById("quickSearch")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "studentsSection"
        )
        .scrollIntoView({
          behavior: "smooth"
        });


      setTimeout(
        () => search.focus(),
        500
      );

    }
  );


/* ================= MODALS ================= */

document
  .getElementById("closeStudentModal")
  .addEventListener(
    "click",
    closeStudentModal
  );


document
  .getElementById("cancelStudent")
  .addEventListener(
    "click",
    closeStudentModal
  );


document
  .getElementById("closeProfile")
  .addEventListener(
    "click",
    () =>
      profileModal.classList.remove(
        "show"
      )
  );


function closeStudentModal() {

  studentModal.classList.remove(
    "show"
  );

  studentForm.reset();

  editingId = null;

}


/* ================= TOAST ================= */

let toastTimer;


function showToast(
  title,
  message,
  error = false
) {

  const toast =
    document.getElementById("toast");

  const icon =
    document.getElementById("toastIcon");

  document.getElementById(
    "toastTitle"
  ).textContent = title;


  document.getElementById(
    "toastMessage"
  ).textContent = message;


  if (error) {

    icon.style.background =
      "#ffeded";

    icon.style.color =
      "#ef4444";

    icon.innerHTML =
      '<i class="fa-solid fa-xmark"></i>';

  } else {

    icon.style.background =
      "#e7f8f0";

    icon.style.color =
      "#16a36a";

    icon.innerHTML =
      '<i class="fa-solid fa-check"></i>';

  }


  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      3500
    );

}


document
  .getElementById("closeToast")
  .addEventListener(
    "click",
    () =>
      document
        .getElementById("toast")
        .classList.remove(
          "show"
        )
  );


/* ================= DARK MODE ================= */

const themeToggle =
  document.getElementById(
    "themeToggle"
  );


themeToggle.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "dark"
    );


    const dark =
      document.body.classList.contains(
        "dark"
      );


    themeToggle.innerHTML =
      dark

        ? '<i class="fa-solid fa-sun"></i>'

        : '<i class="fa-solid fa-moon"></i>';


    localStorage.setItem(
      "darkMode",
      dark
    );

  }
);


if (
  localStorage.getItem(
    "darkMode"
  ) === "true"
) {

  document.body.classList.add(
    "dark"
  );

  themeToggle.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}


/* ================= MOBILE ================= */

document
  .getElementById("mobileMenu")
  .addEventListener(
    "click",
    () =>
      document
        .getElementById("sidebar")
        .classList.toggle("open")
  );


/* ================= HELPERS ================= */

function getInitials(name) {

  return name
    .trim()
    .split(" ")
    .slice(0,2)
    .map(word => word[0])
    .join("")
    .toUpperCase();

}


function formatDate(date) {

  if (!date) return "-";

  const d =
    new Date(date);


  if (isNaN(d)) {
    return date;
  }


  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function escapeHTML(value) {

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}