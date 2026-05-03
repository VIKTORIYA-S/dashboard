import { getData, saveData } from "./storage.js";

let state = {
  period: "2026-0",
  data: getData("2026-0"),
};

export function setPeriod(period) {
  state.period = period;
  state.data = getData(period);
}

export function getState() {
  return state;
}

export function updateData(data) {
  state.data = data;
  saveData(state.period, data);
}
