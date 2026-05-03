import { getData } from "./storage.js";

export function modalTable() {
  const popup = document.querySelector(".popup");
  const modal = document.querySelector(".modal__wrapper");
  const closeBtn = document.querySelector(".modal__close");
    const dateBtn = document.querySelector(".header_button_seed");
    
    const yearSelect = document.getElementById("year");
    const monthSelect = document.getElementById("month");

    let currentPeriod = "2026-0";

  dateBtn.addEventListener("click", () => {
    popup.classList.add("open");
    document.documentElement.classList.add("lock"); // html
    document.body.classList.add("lock");
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.remove("open");
    document.documentElement.classList.remove("lock");
    document.body.classList.remove("lock");
  });

    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.remove("open");
        document.documentElement.classList.remove("lock");
        document.body.classList.remove("lock");
      }
});
    function updatePeriod() {
      currentPeriod = `${yearSelect.value}-${monthSelect.value}`;
      const data = getData(currentPeriod);
      console.log("Загружены данные:", data);
    }

    yearSelect.addEventListener("change", updatePeriod);
    monthSelect.addEventListener("change", updatePeriod);
}
