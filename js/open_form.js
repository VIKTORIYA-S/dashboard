export function toggleForm() {
    const form = document.querySelector(".form_project");
    const form1 = document.querySelector(".form_employee");
    const addBtn = document.querySelector(".header_button_add");
    const cancelBtn = document.querySelector(".btn_reset_project");
    const cancelBtn1 = document.querySelector(".btn_reset_employee");
    const addEmpBtn = document.querySelector(".header_button_employee");

    addBtn.addEventListener("click", () => {
        form.classList.add("open")
    });

    cancelBtn.addEventListener("click", () => {
        form.classList.remove("open");
    });

    addEmpBtn.addEventListener("click", () => {
        form1.classList.add("open");
    });

    cancelBtn1.addEventListener("click", () => {
        form1.classList.remove("open");
    });
}


const modalAvailabilityBtn = document.querySelector(".modal__availability-btn");

modalAvailabilityBtn.addEventListener("click", () => {
    const modal = document.querySelector(".popup_availability");
    modal.classList.remove("open");
});