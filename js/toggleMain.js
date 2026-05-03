export function toggleMain() {
    const projectsBtn = document.querySelector(".projects");
    const employeesBtn = document.querySelector(".employees");
    const projectsContainer = document.querySelector(".container_projects");
    const employeesContainer = document.querySelector(".container_employees");

    projectsBtn.addEventListener("click", () => {
      projectsContainer.classList.add("active");
        employeesContainer.classList.remove("active");
        projectsBtn.style.background = "#6c0053ad";
        projectsBtn.style.borderLeft = "8px solid #b00187ad";
        employeesBtn.style.borderLeft = "none";
        employeesBtn.style.background = "#410032";
    });

    employeesBtn.addEventListener("click", () => {
      employeesContainer.classList.add("active");
        projectsContainer.classList.remove("active");
        employeesBtn.style.background = "#6c0053ad";
        employeesBtn.style.borderLeft = "8px solid #b00187ad";
        projectsBtn.style.borderLeft = "none";
        projectsBtn.style.background = "#410032";

    });
}