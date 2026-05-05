import { initSidebar } from "./js/sidebar.js";
import { toggleMain } from "./js/toggleMain.js";
import { toggleForm } from "./js/open_form.js";
import { modalTable } from "./js/modal_table.js";
import { getData, saveData, initData } from "./js/storage.js";
import { addEmployee, deleteEmployee } from "./js/employees.js";
import { addProject, deleteProject } from "./js/projects.js";
import {
  renderEmployees,
  renderProjects,
  closeAssignmentsModal,
} from "./js/ui.js";
import { initUI } from "./js/ui.js";


// window.rerender = function () {
//   const period = getCurrentPeriod();
//   renderEmployees(period);
//   renderProjects(period);
// };


document.addEventListener("DOMContentLoaded", () => {
  // 1. текущее состояние приложения
  let currentYear = 2026;
  let currentMonth = 0;

  // 2. функция периода
  function getCurrentPeriod() {
    return `${currentYear}-${currentMonth}`;
  }

  function rerender() {
    const period = getCurrentPeriod();
    renderEmployees(period);
    renderProjects(period);

    console.log(period);
  }

  window.rerender = rerender;

  // 3. ИНИЦИАЛИЗАЦИЯ ДАННЫХ (ВАЖНО!)
  initData(getCurrentPeriod());
  initUI();

  rerender();

  initSidebar();
  toggleMain();
  toggleForm();
  modalTable();
  closeAssignmentsModal();

  const form = document.getElementById("employeeForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // ❗ убираем перезагрузку

    const vacationCount =
      Number(document.getElementById("empVacation")?.value) || 0;

    const employee = {
      id: Date.now().toString(),
      name: document.getElementById("empName").value,
      surname: document.getElementById("empSurname").value,
      dob: document.getElementById("empBirthday").value,
      position: document.getElementById("empPosition").value,
      salary: Number(document.getElementById("empSalary").value),
      assignments: [],
      vacationDays: Array.from({ length: vacationCount }, (_, i) => i + 1),
    };

    addEmployee(getCurrentPeriod(), employee);

    form.classList.remove("open");

    console.log("Employee added:", employee);

    rerender();
    form.reset(); // очищаем форму
  });


  const form1 = document.getElementById("projectForm");

  form1.addEventListener("submit", (e) => {
    e.preventDefault(); // ❗ убираем перезагрузку

    const project = {
      id: Date.now().toString(),
      name: document.getElementById("project").value,
      company: document.getElementById("company").value,
      budget: Number(document.getElementById("budget").value),
      capacity: Number(document.getElementById("capacity").value),
      employees: [],
      income: 0,
    };

    console.log(project);
    addProject(getCurrentPeriod(), project);

    form1.classList.remove("open");

    console.log("Project added:", project);

    rerender();

    form1.reset(); // очищаем форму
  });

  function addProject(period, project) {
    const data = getData(period);
    data.projects.push(project);
    saveData(period, data);
    console.log("SAVED DATA:", getData(period));
    }
});


function getCurrentData() {
  return getData(getCurrentPeriod());
}

function updateCurrentData(newData) {
  const period = getCurrentPeriod();
  saveData(period, newData);
}





