// console.log("🔥 assignments.js IS EXECUTING");

import { getData, saveData } from "./storage.js";
import { loadAllData } from "./storage.js";

export function assignEmployeeToProject(period, employeeId, projectId) {
  console.log("ASSIGN CALLED", employeeId, projectId);
  const data = getData(period);

  const employee = data.employees.find(
    (e) => String(e.id) === String(employeeId),
  );

  if (!employee) {
    console.log("STOP: no employee");
    return;
  }
  console.log("DATA:", getData(period));
  console.log("PROJECTS:", getData(period).projects);

  if (!employee.assignments) {
    employee.assignments = [];
  }

  const norm = (v) => String(v);
  const exists = (employee.assignments || []).find(
    (a) => norm(a.projectId) === norm(projectId),
  );
  if (exists) {
    console.log("STOP: already assigned");
    return;
  }

  const used = employee.assignments.reduce(
    (sum, a) => sum + Number(a.capacity),
    0,
  );

  const newCapacity = 1;

  // if (used + newCapacity > 1.5) {
  //   alert("Employee capacity limit exceeded (1.5)");
  //   return;
  // }

  if (used + newCapacity > 1.5) {
    console.log("STOP: capacity limit");
    return;
  }

  console.log("EMPLOYEE BEFORE PUSH:", employee);

  if (!employee.assignments) {
    employee.assignments = [];
  }
  console.log("BEFORE PUSH LINE");
  employee.assignments.push({
    projectId: norm(projectId),
    capacity: newCapacity,
    fit: 0.5,
  });

  console.log(getData(period));
  console.log("AFTER PUSH:", employee.assignments);

  console.log("AFTER ASSIGN:", employee.assignments);
  console.log("ALL EMPLOYEES:", data.employees);

  saveData(period, data);
  console.log("SAVED:", getllData(period));
  console.log("RAW STORAGE:", localStorage.getItem("monthlyData"));
}

export function removeAssignment(period, employeeId, projectId) {
  const data = getData(period);

  const emp = data.employees.find((e) => e.id === employeeId);
  if (!emp) return;

  emp.assignments = emp.assignments.filter((a) => a.projectId !== projectId);

  saveData(period, data);
  rerender();
  refreshProjectPopup();
}

export function getAvailability(emp) {
  const used = emp.assignments?.reduce((sum, a) => sum + a.capacity, 0) || 0;

  return {
    used,
    available: 1.5 - used,
  };
}

export function getVacationCoefficient(emp) {
  // пока заглушка
  return 1;
}