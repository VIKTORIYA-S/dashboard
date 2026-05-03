import { getData, saveData } from "./storage.js";

export function addProject(period, project) {
  const data = getData(period);

  data.project.push(project);

  saveData(period, data);
}

export function deleteProject(period, projectId) {
  const data = getData(period);

  data.projects = data.projects.filter((p) => p.id !== projectId);

  saveData(period, data);
}
