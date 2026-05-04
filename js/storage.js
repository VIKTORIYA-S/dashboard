
const STORAGE_KEY = "monthlyData";

function loadAllData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}


function saveAllData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


// получить данные месяца
// export function getData(period) {
//   const all = loadAllData();
//   return all[period] || { employees: [], projects: [] };
// }
export function getData(period) {
  // console.log("DATA:", getData(period));
  // console.log("PROJECTS:", getData(period).projects);
  const monthlyData = loadAllData();

  const data = monthlyData[period];

  if (!data) {
    return { employees: [], projects: [] };
  }

  return {
    employees: data.employees ?? [],
    projects: data.projects ?? [],
  };
}

// сохранить данные месяца
// export function saveData(period, data) {
//   const monthlyData = loadAllData();
//   monthlyData[period] = data;
//   saveAllData(monthlyData);
// }

// export function saveData(period, data) {
//   const monthlyData = loadAllData();

//   monthlyData[period] = {
//     ...monthlyData[period],
//     ...data,
//   };
export function saveData(period, data) {
  const monthlyData = loadAllData(); // ✔ обязательно const

  monthlyData[period] = data;

  console.log("SAVING PERIOD:", period);
  console.log("DATA BEING SAVED:", data);
  saveAllData(monthlyData);
}



export function initData(period) {
  const monthlyData = loadAllData();

  if (!monthlyData[period]) {
    monthlyData[period] = {
      employees: [],
      projects: [],
    };

    saveAllData(monthlyData);
  }
}









