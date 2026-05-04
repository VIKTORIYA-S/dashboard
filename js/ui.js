import { getData } from "./storage.js";
import { deleteEmployee } from "./employees.js";
import { deleteProject } from "./projects.js";
import { getAvailability, assignEmployeeToProject } from "./assignments.js";

let currentSortField = null;
let sortDirection = "asc";
const norm = (v) => String(v);

export function renderEmployees(period) {
  const data = getData(period);
  // console.log(data);
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
      const emp = data.employees.find((emp) => emp.id === id);
      openAssignmentsModal(emp, data);
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
      const emp = data.employees.find((emp) => emp.id === id);

      const { used, available } = getAvailability(emp);

      alert(`Used: ${used}\nAvailable: ${available}`);
    }
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
          ${emp.assignments?.length ? `Projects (${emp.assignments.length})` : "No Projects"}
        </button>
      </td>
      <td>-</td>
      <td>
        <button class="availability-btn ${isOver ? "over" : ""}" data-id="${emp.id}">
          ${used.toFixed(1)} / 1.5
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
    const assignedEmployees = data.employees.filter(
      (emp) =>
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

      const effective = capacity * fit;

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
      openEmployeesPopup(projectId, period);
      openProjectPopup(
    { id: projectId }, // 👈 ВАЖНО
    period
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

function openEmployeesPopup(emp, period) {
  const popup = document.querySelector("#employeesPopup");

  if (!popup) return;

  popup.classList.add("open");

  document.querySelector("#employeePopupTitle").textContent =
    `Assignment for ${emp.name}`;

  renderEmployeeProjects(emp.id, period);
}

function openProjectPopup(projectId, period) {
  const data = getData(period);

  const project = data.projects.find((p) => String(p.id) === String(projectId));
console.log("OPEN PROJECT:", project);
  const popup = document.querySelector("#projectPopup");

  if (!popup) return;

  popup.classList.add("open");

  document.querySelector("#projectPopupTitle").textContent =
    `Employees on ${project?.name || "-"}`;

  popup.classList.remove("open");
  renderProjectEmployees(projectId, period);
}



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
    const project = data.projects.find((p) => p.id === a.projectId);

    tbody.innerHTML += `
      <tr>
        <td>${project?.name || "-"}</td>
        <td>${a.capacity || "-"}</td>
        <td><button class="unassign-btn">Unassign</button></td>
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

  modalTbody.onclick = (e) => {
    const btn = e.target.closest(".unassign-btn");
    if (!btn) return;

    const empId = btn.dataset.emp;
    const projectId = btn.dataset.project;

    removeAssignment(period, empId, projectId);
    rerender();

    openAssignmentsModal(
      data.employees.find((e) => e.id === empId),
      getData(period),
    );

    modal.classList.remove("open");
  };

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

  employee?.assignments?.forEach(a => {
    const project = data.projects.find(p => p.id === a.projectId);

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
    data.employees.forEach(emp => {
      console.log("EMP:", e.name, e.assignments);

    const assignment = emp.assignments?.find(a => a.projectId === id);

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
