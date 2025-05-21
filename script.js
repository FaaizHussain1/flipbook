// References to DOM Elements
const book = document.querySelector("#book")
const container = document.querySelector(".container")

const paper1 = document.querySelector("#p1")
const paper2 = document.querySelector("#p2")
const paper3 = document.querySelector("#p3")
const paper4 = document.querySelector("#p4")

// Business Logic
let currentLocation = 1
const numOfPapers = 4
const maxLocation = numOfPapers + 1
let scrollThreshold = 0
let lastScrollPosition = 0
let isFlipping = false
let scrollTimer = null

// Initialize the book
function init() {
    // Set initial state
    closeBook(true)

    // Calculate scroll thresholds
    const containerHeight = container.scrollHeight
    scrollThreshold = containerHeight / (numOfPapers + 2) // +2 for start and end buffer

    // Add scroll event listener to the container instead of window
    container.addEventListener("scroll", handleScroll)

    // Add wheel event listener for more responsive page flipping
    container.addEventListener("wheel", handleWheel, { passive: false })

    // Add keyboard navigation
    document.addEventListener("keydown", handleKeyDown)

    // Add touch support for mobile
    setupTouchEvents()
}

function openBook() {
    book.style.transform = "translateX(50%)"
}

function closeBook(isAtBeginning) {
    if (isAtBeginning) {
        book.style.transform = "translateX(0%)"
    } else {
        book.style.transform = "translateX(100%)"
    }
}

function handleScroll() {
    // If we're currently flipping a page, don't trigger another flip
    if (isFlipping) return

    const scrollPosition = container.scrollTop
    const scrollDirection = scrollPosition > lastScrollPosition ? "down" : "up"

    // Calculate which page we should be on based on scroll position
    const targetPage = Math.floor(scrollPosition / scrollThreshold)

    // Only flip if we've scrolled enough to reach a new threshold
    if (scrollDirection === "down" && targetPage >= currentLocation && currentLocation < maxLocation) {
        // Start flipping with a small delay to prevent rapid flipping
        isFlipping = true
        goNextPage()

        // Set a timer to allow the next flip after the animation completes
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
            isFlipping = false
        }, 600) // Slightly longer than the CSS transition
    } else if (scrollDirection === "up" && targetPage < currentLocation - 1 && currentLocation > 1) {
        // Start flipping with a small delay to prevent rapid flipping
        isFlipping = true
        goPrevPage()

        // Set a timer to allow the next flip after the animation completes
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
            isFlipping = false
        }, 600) // Slightly longer than the CSS transition
    }

    lastScrollPosition = scrollPosition
}

// Handle mouse wheel events for more responsive page flipping
function handleWheel(e) {
    // If we're currently flipping a page, don't trigger another flip
    if (isFlipping) {
        e.preventDefault()
        return
    }

    if (e.deltaY > 0) {
        // Scroll down - go to next page
        if (currentLocation < maxLocation) {
            e.preventDefault()
            isFlipping = true
            goNextPage()

            // Set a timer to allow the next flip after the animation completes
            clearTimeout(scrollTimer)
            scrollTimer = setTimeout(() => {
                isFlipping = false
            }, 600)
        }
    } else {
        // Scroll up - go to previous page
        if (currentLocation > 1) {
            e.preventDefault()
            isFlipping = true
            goPrevPage()

            // Set a timer to allow the next flip after the animation completes
            clearTimeout(scrollTimer)
            scrollTimer = setTimeout(() => {
                isFlipping = false
            }, 600)
        }
    }
}

// Handle keyboard navigation
function handleKeyDown(e) {
    if (isFlipping) return

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (currentLocation < maxLocation) {
            isFlipping = true
            goNextPage()

            clearTimeout(scrollTimer)
            scrollTimer = setTimeout(() => {
                isFlipping = false
            }, 600)
        }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (currentLocation > 1) {
            isFlipping = true
            goPrevPage()

            clearTimeout(scrollTimer)
            scrollTimer = setTimeout(() => {
                isFlipping = false
            }, 600)
        }
    }
}

// Setup touch events for mobile
function setupTouchEvents() {
    let touchStartY = 0
    let touchStartTime = 0

    container.addEventListener(
        "touchstart",
        (e) => {
            touchStartY = e.touches[0].clientY
            touchStartTime = Date.now()
        },
        { passive: false },
    )

    container.addEventListener(
        "touchmove",
        (e) => {
            if (isFlipping) {
                e.preventDefault()
                return
            }

            const touchY = e.touches[0].clientY
            const diff = touchStartY - touchY
            const timeDiff = Date.now() - touchStartTime

            // Only process if it's a deliberate swipe (not a small movement)
            // and not too fast (to prevent accidental flips)
            if (Math.abs(diff) > 30 && timeDiff > 50 && timeDiff < 500) {
                e.preventDefault()

                if (diff > 0) {
                    // Swipe up - next page
                    if (currentLocation < maxLocation) {
                        isFlipping = true
                        goNextPage()

                        clearTimeout(scrollTimer)
                        scrollTimer = setTimeout(() => {
                            isFlipping = false
                        }, 600)
                    }
                } else {
                    // Swipe down - previous page
                    if (currentLocation > 1) {
                        isFlipping = true
                        goPrevPage()

                        clearTimeout(scrollTimer)
                        scrollTimer = setTimeout(() => {
                            isFlipping = false
                        }, 600)
                    }
                }

                // Reset touch tracking
                touchStartY = touchY
                touchStartTime = Date.now()
            }
        },
        { passive: false },
    )
}

function goNextPage() {
    if (currentLocation < maxLocation) {
        switch (currentLocation) {
            case 1:
                openBook()
                paper1.classList.add("flipped")
                paper1.style.zIndex = 1
                break
            case 2:
                paper2.classList.add("flipped")
                paper2.style.zIndex = 2
                break
            case 3:
                paper3.classList.add("flipped")
                paper3.style.zIndex = 3
                break
            case 4:
                paper4.classList.add("flipped")
                paper4.style.zIndex = 4
                closeBook(false)
                break
            default:
                throw new Error("unknown state")
        }
        currentLocation++

        // Update scroll position to match the current page
        updateScrollPosition()
    }
}

function goPrevPage() {
    if (currentLocation > 1) {
        switch (currentLocation) {
            case 2:
                closeBook(true)
                paper1.classList.remove("flipped")
                paper1.style.zIndex = 4
                break
            case 3:
                paper2.classList.remove("flipped")
                paper2.classList.remove("flipped")
                paper2.style.zIndex = 3
                break
            case 4:
                paper3.classList.remove("flipped")
                paper3.style.zIndex = 2
                break
            case 5:
                paper4.classList.remove("flipped")
                paper4.style.zIndex = 1
                openBook()
                break
            default:
                throw new Error("unknown state")
        }
        currentLocation--

        // Update scroll position to match the current page
        updateScrollPosition()
    }
}

// Update the container's scroll position to match the current page
function updateScrollPosition() {
    const targetScrollPosition = (currentLocation - 1) * scrollThreshold

    // Use smooth scrolling to animate to the new position
    container.scrollTo({
        top: targetScrollPosition,
        behavior: "smooth",
    })
}

// Initialize the book when the page loads
window.onload = init
