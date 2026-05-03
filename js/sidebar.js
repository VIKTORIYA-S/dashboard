export function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main");
    const toggleBtn = document.querySelector(".toggle-sidebar");
    const burger = document.querySelector(".burger");
    const toggeSidebar = document.querySelector(".toggle-sidebar");

    burger.addEventListener("click", () => {
        sidebar.classList.toggle("closed");
        main.classList.toggle("full");
        toggleBtn.classList.toggle("open");
    });

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("closed");
        main.classList.toggle("full");
        toggleBtn.classList.toggle("open");
    });
}
