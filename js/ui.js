import { getData, saveData } from "./storage.js";
import { deleteEmployee } from "./employees.js";
import { deleteProject } from "./projects.js";
import { getAvailability, assignEmployeeToProject } from "./assignments.js";
import { getVacationCoefficient } from "./assignments.js";

let currentSortField = null;
let sortDirection = "asc";
const norm = (v) => String(v);

export function renderEmployees(period) {
  const data = getData(period);
  console.log(period);
  const options = data.projects
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join("");
  const tbody = document.querySelector("#employeesTable tbody");

  tbody.innerHTML = "";

  // 👇 защита от дублирования
  tbody.onclick = (event) => {
    const showBtn = event.target.closest(".show-btn");
    const assignBtn = event.target.closest(".assign-btn");

    if (showBtn) {
      const id = showBtn.dataset.id;

      openEmployeesPopup(id, period);
    }

    if (assignBtn) {
      console.log("ABOUT TO CALL ASSIGN");

      const id = assignBtn.dataset.id;
      const data = getData(period);
      const options = data.projects
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("");
      const modal = document.querySelector("#assignModal");

      modal.innerHTML = `
  <select id="projectSelect">
    <option value="">Select project</option>
    ${options}
  </select>
  <button id="confirmAssign">Assign</button>
`;

      modal.style.display = "flex";

      modal.querySelector("#confirmAssign").onclick = () => {
        console.log("CLICK FIRED");

        const projectId = modal.querySelector("#projectSelect").value;
        if (!projectId) return;

        assignEmployeeToProject(period, id, projectId);

        modal.style.display = "none";
        rerender();
      };
    }

    // 🗑 DELETE
    if (event.target.classList.contains("delete-btn")) {
      const id = event.target.dataset.id;
      deleteEmployee(period, id);
      rerender();
    }

    if (event.target.classList.contains("availability-btn")) {
      const id = event.target.dataset.id;

      openAvailabilityPopup(id, period);
    }

    // const closeBtn = document.querySelector(".modal__close_availability");
    // console.log(closeBtn);
    // closeBtn.addEventListener("click", (e) => {
    //   console.log("CLICK FIRED");
    //   e.preventDefault();
    //   if (e.target === closeBtn) {
    //     popup.classList.remove("open");
    //     document.documentElement.classList.remove("lock");
    //     document.body.classList.remove("lock");
    //   }
    //   if (e.target === popup) {
    //     popup.classList.remove("open");
    //     document.documentElement.classList.remove("lock");
    //     document.body.classList.remove("lock");
    //   }
    // });
  };

  data.employees.forEach((emp) => {
    console.log("EMP:", emp.name, emp.assignments);

    const tr = document.createElement("tr");

    const { used } = getAvailability(emp);
    const isOver = used > 1.5;

    let availabilityClass = "availability-low";

    if (used >= 1) availabilityClass = "availability-medium";
    if (used >= 1.5) availabilityClass = "availability-high";

    // console.log(availabilityClass);

    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${emp.surname}</td>
      <td>${emp.dob ? calculateAge(emp.dob) : "-"}</td>
      <td>${emp.position}</td>
      <td>${"$" + emp.salary}</td>
      <td>-</td>
      <td>
        <button class="show-btn" data-id="${emp.id}">
          ${isOver ? "over" : ""} ${emp.assignments?.length ? `Projects (${emp.assignments.length})` : "No Projects"} ${used.toFixed(1)} / 1.5
        </button>
      </td>
      <td>-</td>
      <td>
        <button class="availability-btn" data-id="${emp.id}">
          Availability
        </button>

        <button class="assign-btn" data-id="${emp.id}">
          Assign
        </button>

        <button class="delete-btn" data-id="${emp.id}">
          Delete
        </button>
      </td>
    `;

    tbody.appendChild(tr);
    // console.log(data.employees);
  });
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

function handleDelete(e, period) {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    deleteEmployee(period, id);
    rerender();
  }
}

export function renderProjects(period) {
  const data = getData(period);
  const tbody = document.querySelector("#projectsTable tbody");

  tbody.innerHTML = "";

  tbody.onclick = (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    const showEmployeesBtn = event.target.closest(".show-employees-btn");

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;

      deleteProject(period, id);
      rerender();
      return; // 👈 важно
    }
    if (showEmployeesBtn) {
      const projectId = showEmployeesBtn.dataset.id;

      console.log("OPEN PROJECT:", projectId);

      openEmployeesPopup(projectId, period);
      return; // 👈 тоже важно
    }
  };

  data.projects.forEach((project) => {
    const tr = document.createElement("tr");

    const norm = (v) => String(v);
    const assignedEmployees = data.employees.filter((emp) =>
      emp.assignments?.some((a) => norm(a.projectId) === norm(project.id)),
    );
    // console.log(assignedEmployees);
    // console.log("ASSIGNED TO PROJECT:", assignedEmployees);

    const used = assignedEmployees.reduce((sum, emp) => {
      const assignment = emp.assignments.find(
        (a) => String(a.projectId) === String(project.id),
      );

      // console.log("project.id:", project.id);
      // console.log(data.employees.map((e) => e.assignments));
      // console.log(data.employees.flatMap((e) => e.assignments));

      if (!assignment) return sum;

      const capacity = Number(assignment.capacity) || 0;
      const fit = Number(assignment.fit) || 0;
      const vacationCoef = getVacationCoefficient(emp);
      const effective = capacity * fit * vacationCoef;

      // console.log({ capacity, fit, effective });

      return sum + effective;
    }, 0);

    tr.innerHTML = `
            <td>${project.company}</td>
            <td>${project.name}</td>
            <td>${project.budget}</td>
            <td>${used.toFixed(1)} / ${project.capacity}</td>
            <td><button class="show-employees-btn" data-id="${project.id}">
      Show Employees ${assignedEmployees.length}
    </button></td>
            <td>${project.income}</td>
            <td><button data-id="${project.id}" class="delete-btn">Delete</button></td>
        `;

    tbody.appendChild(tr);
    // console.log(data.projects);
  });

  tbody.onclick = null; // очистить старый
  tbody.onclick = (event) => {
    const btn = event.target.closest(".show-employees-btn");

    if (btn) {
      const projectId = btn.dataset.id;

      console.log("CLICK PROJECT ID:", projectId);
      // openEmployeesPopup(projectId, period);
      openProjectPopup(
        { id: projectId }, // 👈 ВАЖНО
        period,
      );
    }
  };
}

// function openEmployeesPopup(projectId, period) {
//   console.log("OPEN POPUP PERIOD:", period);
//   console.log("PROJECT ID:", projectId);
//   const popup = document.querySelector("#employeesPopup");

//   popup.classList.add("open");

//   renderProjectEmployees(projectId, period);
// }

export function openEmployeesPopup(employeeId, period) {
  const popup = document.querySelector("#employeesPopup");

  if (!popup) return;

  popup.classList.add("open");

  const data = getData(period);

  const employee = data.employees.find(
    (e) => String(e.id) === String(employeeId),
  );

  document.querySelector("#employeePopupTitle").textContent =
    `Assignment for ${employee?.name || "-"}`;

  renderEmployeeProjects(employeeId, period);
}

// function openProjectPopup(projectId, period) {
//   const data = getData(period);

//   const project = data.projects.find((p) => String(p.id) === String(projectId));
// console.log("OPEN PROJECT:", project);
//   const popup = document.querySelector("#projectPopup");

//   if (!popup) return;

//   popup.classList.add("open");

//   document.querySelector("#projectPopupTitle").textContent =
//     `Employees on ${project?.name || "-"}`;

//   // popup.classList.remove("open");
//   renderProjectEmployees(projectId, period);
// }

function renderProjectEmployees(projectId, period) {
  const data = getData(period);

  const norm = (v) => String(v);

  const tbody = document.querySelector("#projectEmployeesBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  const assignedEmployees = data.employees.filter((emp) =>
    emp.assignments?.some((a) => norm(a.projectId) === norm(projectId)),
  );

  if (assignedEmployees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No employees assigned</td></tr>`;
    return;
  }

  const rows = assignedEmployees
    .map((emp) => {
      const a = emp.assignments.find(
        (a) => norm(a.projectId) === norm(projectId),
      );

      return `
        <tr>
          <td>${emp.name}</td>
          <td>${a.capacity}</td>
          <td>${a.fit}</td>
          <td>-</td>
          <td>${(a.capacity * a.fit).toFixed(2)}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>
            <button class="unassign-btn"
              data-emp="${emp.id}"
              data-project="${projectId}">
              Unassign
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rows;
}

export function renderEmployeeProjects(employeeId, period) {
  const data = getData(period);

  const tbody = document.querySelector("#employeeProjectsBody");
  tbody.innerHTML = "";

  const employee = data.employees.find(
    (e) => String(e.id) === String(employeeId),
  );

  if (!employee?.assignments?.length) {
    tbody.innerHTML = `<tr><td colspan="3">No projects</td></tr>`;
    return;
  }

  employee.assignments.forEach((a) => {
    const project = data.projects.find(
      (p) => String(p.id) === String(a.projectId),
    );

    tbody.innerHTML += `
      <tr>
        <td>${project?.name || "-"}</td>
        <td>${a.capacity || "-"}</td>
        <td>${a.fit || "-"}</td>
        <td>${a.vacation || "-"}</td>

        <td>
          ${a.capacity && a.fit ? (a.capacity * a.fit).toFixed(2) : "-"}
        </td>

        <td>${a.revenue || "-"}</td>
        <td>${a.cost || "-"}</td>
        <td>${a.profit || "-"}</td>

        <td>
          <button class="unassign-btn"
            data-emp="${employee.id}"
            data-project="${a.projectId}">
            Unassign
          </button>
        </td>
      </tr>
    `;
  });
}

function openAssignmentsModal(emp, data) {
  const modal = document.querySelector(".popup_employees");
  const modalTitle = document.querySelector(".modal__title");
  const modalTbody = document.querySelector(".modal__table tbody");

  modalTitle.textContent = `Projects of ${emp.name}`;
  modalTbody.innerHTML = "";

  // modalTbody.onclick = (e) => {
  //   const btn = e.target.closest(".unassign-btn");
  //   if (!btn) return;

  //   const empId = btn.dataset.emp;
  //   const projectId = btn.dataset.project;

  //   removeAssignment(period, empId, projectId);
  //   rerender();

  //   openAssignmentsModal(
  //     data.employees.find((e) => e.id === empId),
  //     getData(period),
  //   );

  //   modal.classList.remove("open");
  // };

  if (!emp.assignments || emp.assignments.length === 0) {
    modalTbody.innerHTML = `<tr><td colspan="9">No assignments</td></tr>`;
  } else {
    emp.assignments.forEach((a) => {
      const project = data.projects.find((p) => p.id === a.projectId);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${emp.name}</td>
        <td>${a.capacity}</td>
        <td>${a.fit}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>
          <button>Seed</button>
          <button>Unassign</button>
        </td>
      `;

      modalTbody.appendChild(tr);
    });
  }
  modal.classList.add("open");
}

//закрыть модалку
export function closeAssignmentsModal() {
  const modal = document.getElementById("employeesPopup");
  const modalClose = document.querySelector("#employeesPopup .modal__close");

  if (!modal || !modalClose) return;

  modalClose.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("open");
    }
  });
}

export function initUI() {
  function createAssignModal() {
    const modal = document.createElement("div");

    const popup = document.querySelector("#projectPopup");
    const closeBtn = popup?.querySelector(".modal__close");

    modal.id = "assignModal";
    modal.style.position = "absolute";
    modal.style.top = "50%";
    modal.style.right = "0%";
    modal.style.display = "none";
    modal.style.background = "#fff";
    modal.style.border = "1px solid #410032";
    modal.style.padding = "10px";
    modal.style.zIndex = "1000";

    document.body.appendChild(modal);

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        popup.classList.remove("open");
      });
    }

    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.remove("open");
      }
    });
  }
  createAssignModal();
}

function renderPopupTable({ mode, id, period }) {
  const data = getData(period);

  const tbody =
    mode === "employee"
      ? document.querySelector("#employeeProjectsBody")
      : document.querySelector("#projectEmployeesBody");

  tbody.innerHTML = "";
  if (mode === "employee") {
    const employee = data.employees.find(
      (e) => String(e.id) === String(employeeId),
    );

    employee?.assignments?.forEach((a) => {
      const project = data.projects.find((p) => p.id === a.projectId);

      tbody.innerHTML += `
      <tr>
        <td>${project?.name}</td>
        <td>${a.capacity}</td>
        <td>
          <button class="unassign-btn">Unassign</button>
        </td>
      </tr>
    `;
    });
  }
  if (mode === "project") {
    data.employees.forEach((emp) => {
      console.log("EMP:", e.name, e.assignments);

      const assignment = emp.assignments?.find((a) => a.projectId === id);

      if (!assignment) return;

      tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>${assignment.capacity}</td>
        <td>${assignment.fit || "-"}</td>
        <td>
          <button class="unassign-btn">Unassign</button>
        </td>
      </tr>
    `;
    });
  }
}

let currentProjectId = null;
let currentPeriod = null;
function openProjectPopup(project, period) {
  currentProjectId = project.id;
  currentPeriod = period;

  const popup = document.querySelector("#projectPopup");
  popup.classList.add("open");

  document.querySelector("#projectPopupTitle").textContent =
    `Employees on ${project.name}`;

  renderProjectEmployees(project.id, period);
}

export function refreshProjectPopup() {
  if (!currentProjectId || !currentPeriod) return;

  renderProjectEmployees(currentProjectId, currentPeriod);
}

export function renderCalendar(year, month, employee, period) {
  const tbody = document.querySelector("#availabilitEmployeesBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  // обработчик кликов по дням
  tbody.onclick = (e) => {
    const cell = e.target.closest(".calendar-day");
    if (!cell) return;

    const day = Number(cell.dataset.day);

    if (!employee.vacationDays) {
      employee.vacationDays = [];
    }

    const index = employee.vacationDays.indexOf(day);

    if (index > -1) {
      employee.vacationDays.splice(index, 1); // убрать день
    } else {
      employee.vacationDays.push(day); // добавить день
    }

    // сохраняем изменения
    const data = getData(period);
    const emp = data.employees.find(
      (e) => String(e.id) === String(employee.id),
    );
    if (emp) {
      emp.vacationDays = employee.vacationDays;
      saveData(period, data);
    }

    // перерисовываем календарь и обновляем счётчик
    renderCalendar(year, month, employee, period);
    updateVacationCounter(employee);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let start = firstDay === 0 ? 6 : firstDay - 1;
  let row = document.createElement("tr");

  // пустые ячейки до первого дня
  for (let i = 0; i < start; i++) {
    row.innerHTML += `<td></td>`;
  }

  // дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    if ((start + day - 1) % 7 === 0) {
      tbody.appendChild(row);
      row = document.createElement("tr");
    }

    const isVacation = employee.vacationDays?.includes(day);

    row.innerHTML += `
      <td class="calendar-day ${isVacation ? "vacation" : ""}" data-day="${day}">
        ${day}
      </td>
    `;
  }

  tbody.appendChild(row);

  // обновляем счётчик при рендере
  updateVacationCounter(employee);
}




// export function openAvailabilityPopup(employeeId, period) {
//   const popup = document.querySelector("#availabilityPopup");

//   if (!popup) return;

//   popup.classList.add("open");
//   document.documentElement.classList.add("lock");
//   document.body.classList.add("lock");

//   // заголовок (опционально)
//   const data = getData(period);

//   const employee = data.employees.find(
//     (e) => String(e.id) === String(employeeId),
//   );

//   console.log(employee);

//   const index = employee.vacationDays.indexOf(day);

//   if (index > -1) {
//     employee.vacationDays.splice(index, 1);
//   } else {
//     employee.vacationDays.push(day);
//   }

//   saveData(period, data);

//   const emp = data.employees.find((e) => String(e.id) === String(employeeId));

//   console.log("FOUND EMPLOYEE:", employee);

//   if (!employee) {
//     console.log("❌ EMPLOYEE NOT FOUND");
//     return;
//   }

//   popup.classList.add("open");

//   const now = new Date();

//   renderCalendar(now.getFullYear(), now.getMonth(), employee, period);
// }


export function openAvailabilityPopup(employeeId, period) {

  const popup = document.querySelector("#availabilityPopup");
  if (!popup) return;
  popup.classList.add("open");
  document.documentElement.classList.add("lock");
  document.body.classList.add("lock");

  const data = getData(period);
  const employee = data.employees.find(
    (e) => String(e.id) === String(employeeId),
  );
  if (!employee) return;

  updateVacationCounter(employee);
  
  const titleEl = document.getElementById("availabilityPopupTitle");
  if (titleEl) {
    titleEl.textContent = `${employee.name} - Availability`;
  }

  const now = new Date();
  renderCalendar(now.getFullYear(), now.getMonth(), employee, period);
}



const tbody = document.querySelector("#availabilityPopup table tbody");
tbody.onclick = (e) => {
  const cell = e.target.closest("td");
  if (!cell) return;
  const day = Number(cell.dataset.day);

  const data = getData(period);
  const employee = data.employees.find(
    (emp) => String(emp.id) === String(employeeId),
  );

  if (!employee) return;

  const index = employee.vacationDays.indexOf(day);
  if (index > -1) {
    employee.vacationDays.splice(index, 1);
  } else {
    employee.vacationDays.push(day);
  }

  saveData(period, data);
  updateVacationCounter(employee);
  renderCalendar(year, month, employee, period);
};


function updateVacationCounter(employee) {
  console.log(employee);
  const used = employee.vacationDays.length;
  const total = 21; // или возьмите из employee.totalVacationDays, если храните
  document.getElementById("vacationDays").textContent = used;
  document.getElementById("totalVacationDays").textContent = total;
}



const availabilityPopup = document.querySelector("#availabilityPopup");
const closeBtn = document.querySelector(".modal__close_availability");

// крестик
closeBtn.addEventListener("click", () => {
  availabilityPopup.classList.remove("open");
  document.documentElement.classList.remove("lock");
  document.body.classList.remove("lock");
});

// клик по фону
availabilityPopup.addEventListener("click", (e) => {
  if (e.target === availabilityPopup) {
    availabilityPopup.classList.remove("open");
    document.documentElement.classList.remove("lock");
    document.body.classList.remove("lock");
  }
});




