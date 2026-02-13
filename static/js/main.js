const container = document.getElementById("mainContent");
const sections = document.querySelectorAll(".fullscreen");

const dots = document.querySelectorAll(".dot");
const pageIndicator = document.getElementById("pageIndicator");

const overlay = document.getElementById("scrollFadeOverlay");


let currentIndex = 0;
let isAnimating = false;

let touchStartY = 0;
let touchEndY = 0;

const lightPages = [2];

dots.forEach(dot => {
    dot.addEventListener("click", () => {
        const index = parseInt(dot.dataset.index);
        scrollToIndex(index);
    });
});

function updateIndicator() {
    dots.forEach(dot => dot.classList.remove("active"));
    dots[currentIndex].classList.add("active");

    if (currentIndex > 0) {
        pageIndicator.classList.add("visible");
    } else {
        pageIndicator.classList.remove("visible");
    }

    if(lightPages.includes(currentIndex)) {
        pageIndicator.classList.add("light-theme");
    } else {
        pageIndicator.classList.remove("light-theme");
    }
}

function scrollToIndex(index) {
    if (index < 0 || index >= sections.length || isAnimating) return;

    isAnimating = true;
    currentIndex = index;

    container.scrollTo({
        top: sections[index].offsetTop,
        behavior: "smooth"
    });

    updateIndicator();

    setTimeout(() => {
        isAnimating = false;
    }, 700);
}


// --- Desktop: Wheel Event ---
container.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (isAnimating) return;

    if (e.deltaY > 0) {
        scrollToIndex(currentIndex + 1);
    } else {
        scrollToIndex(currentIndex - 1);
    }
}, { passive: false });

// --- Mobile: Touch Events ---
container.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

container.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
}, { passive: true });

function handleGesture() {
    const swipeDistance = touchStartY - touchEndY;
    const threshold = 50;

    if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
            scrollToIndex(currentIndex + 1);
        } else {
            scrollToIndex(currentIndex - 1);
        }
    }
}

// document.getElementById("scrollArrow")
document.querySelectorAll(".arrowButton").forEach(
    (button) => {button.addEventListener("click", () => {
        scrollToIndex(currentIndex + 1);
    })
});