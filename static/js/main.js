const container = document.getElementById("mainContent");
const sections = document.querySelectorAll(".fullscreen");

let currentIndex = 0;
let isAnimating = false;

// Variables to track touch position
let touchStartY = 0;
let touchEndY = 0;

function scrollToIndex(index) {
    if (index < 0 || index >= sections.length || isAnimating) return;

    isAnimating = true;
    currentIndex = index;

    container.scrollTo({
        top: sections[index].offsetTop,
        behavior: "smooth"
    });

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
    const threshold = 50; // Minimum pixels to trigger a scroll

    if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
            // Swiped up (move to next section)
            scrollToIndex(currentIndex + 1);
        } else {
            // Swiped down (move to previous section)
            scrollToIndex(currentIndex - 1);
        }
    }
}

document.getElementById("scrollArrow").addEventListener("click", () => {
    scrollToIndex(1); // Scrolls to the second section (detailScreen)
});