function toggleMenu() {
    const navList = document.getElementById("nav-list");
    const menuIcon = document.querySelector(".mobile-menu-icon");
    
    navList.classList.toggle("active");
    menuIcon.classList.toggle("active");
}