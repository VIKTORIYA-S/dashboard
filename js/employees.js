import { getData, saveData } from "./storage.js";

export function addEmployee(period, employee) {
  const data = getData(period);

  data.employees.push(employee);

  saveData(period, data);
}

export function deleteEmployee(period, employeeId) {
  const data = getData(period);

  data.employees = data.employees.filter((emp) => emp.id !== employeeId);

  saveData(period, data);
}
