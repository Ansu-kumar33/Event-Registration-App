document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nav-button");

  buttons.forEach((button, index) => {
    button.style.setProperty("--delay", `${index * 120}ms`);
  });
});