import { getData } from "./storage.js";
import { deleteEmployee } from "./employees.js";
import { deleteProject } from "./projects.js";
import { getAvailability, assignEmployeeToProject } from "./assignments.js";



let currentSortField = null;
let sortDirection = "asc";

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
    console.log("CLICK DETECTED:", event.target);
    console.log("CURRENT TARGET:", event.currentTarget);
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
      // const data = getData(period);
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

      // console.log(data.employees);

      const assignedEmployees = data.employees.filter((emp) =>
        emp.assignments.some((a) => String(a.projectId) === String(project.id)),
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
      console.log(data.employees[0]);
    });
  
  tbody.onclick = null; // очистить старый
  tbody.onclick = (event) => {
    const btn = event.target.closest(".show-employees-btn");

    if (btn) {
      const projectId = btn.dataset.id;
      openEmployeesPopup(projectId, period);
    }
  };
}


function openEmployeesPopup(projectId, period) {
  console.log("OPEN POPUP PERIOD:", period);
  console.log("PROJECT ID:", projectId);
  const popup = document.querySelector("#employeesPopup");

  popup.classList.add("open");

  renderProjectEmployees(projectId, period);
}


function renderProjectEmployees(projectId, period) {
  const data = getData(period); // или period, если у тебя так

  console.log("DATA FROM STORAGE:", data);
  console.log("EMPLOYEES TYPE:", typeof data?.employees);
  console.log("EMPLOYEES:", data?.employees);
  // //////////////////////////////////////////////
  //добавила временно
  console.log("PROJECT ID:", projectId);

  data.employees.forEach((emp) => {
    console.log("EMP:", emp.name, emp.assignments);
  });
// ////////////////////////////////////////////////
  const tbody = document.querySelector("#employeesPopup tbody");

  if (!tbody) {
    console.log("❌ tbody не найден");
    return;
  }

  tbody.innerHTML = ""; // ❗ очищаем, чтобы не было дублей

  const assignedEmployees = data.employees.filter((emp) =>
    emp.assignments?.some((a) => String(a.projectId) === String(projectId)),
  );

  console.log("ASSIGNED TO PROJECT:", assignedEmployees);

  if (assignedEmployees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No employees assigned</td></tr>`;
    return;
  }

  const rows = assignedEmployees
    .map((emp) => {
      const a = emp.assignments.find(
        (a) => String(a.projectId) === String(projectId),
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


// function renderProjectEmployees(projectId, period) {
//   const data = getData(period);

//   const tbody = document.querySelector("#employeesPopup tbody");
//   if (!tbody) return;

//   tbody.innerHTML = "";

//   const employees = data.employees.filter((emp) =>
//     emp.assignments?.some((a) => String(a.projectId) === String(projectId)),
//   );

//   if (employees.length === 0) {
//     tbody.innerHTML = `
//       <tr>
//         <td colspan="9">No employees assigned</td>
//       </tr>
//     `;
//     return;
//   }

//   const rows = employees
//     .map((emp) => {
//       const a = emp.assignments.find(
//         (x) => String(x.projectId) === String(projectId),
//       );

//       const effective = a.capacity * a.fit;

//       return `
//       <tr>
//         <td>${emp.name} ${emp.surname}</td>
//         <td>${a.capacity.toFixed(2)}</td>
//         <td>${a.fit.toFixed(2)}</td>
//         <td>-</td>
//         <td>${effective.toFixed(2)}</td>
//         <td>-</td>
//         <td>-</td>
//         <td>-</td>
//         <td>
//           <button class="unassign-btn"
//             data-emp="${emp.id}"
//             data-project="${projectId}">
//             Unassign
//           </button>
//         </td>
//       </tr>
//     `;
//     })
//     .join("");

//   tbody.innerHTML = rows;
// }
