document.addEventListener("DOMContentLoaded", () => {
    // Images array - using the same order as provided
    const images = [
        "img-8.png",
        "img-7.png",
        "img-6.png",
        "img-5.png",
        "img-3.png",
        "img-4.png",
        "img-2.png",
        "img-1.png",
    ]

    const totalPages = images.length
    const book = document.getElementById("book")
    const currentPageElement = document.getElementById("current-page")
    const totalPagesElement = document.getElementById("total-pages")

    // Set total pages in the UI
    totalPagesElement.textContent = totalPages.toString()

    // Current page index (0-based)
    let currentPage = 0

    // Book state
    let isOpen = false
    let isAnimating = false

    // Create pages
    function createPages() {
        // Clear any existing pages
        book.innerHTML = ""

        // Create pages with front and back sides
        for (let i = 0; i < totalPages; i++) {
            const page = document.createElement("div")
            page.className = "page"
            page.id = `page-${i}`

            // Set z-index in reverse order so first page is on top
            page.style.zIndex = totalPages - i

            // Create front side of the page
            const pageFront = document.createElement("div")
            pageFront.className = "page-front"
            pageFront.style.backgroundImage = `url(${images[i]})`

            // Create back side of the page
            const pageBack = document.createElement("div")
            pageBack.className = "page-back"

            // If there's a next image, use it for the back
            if (i < totalPages - 1) {
                pageBack.style.backgroundImage = `url(${images[i + 1]})`
            } else {
                // Last page back is blank
                pageBack.style.backgroundColor = "#f8f8f8"
            }

            // Append sides to the page
            page.appendChild(pageFront)
            page.appendChild(pageBack)

            // Add page to the book
            book.appendChild(page)
        }
    }

    // Initialize the book
    createPages()

    // Optimized scroll handler with throttling
    let lastScrollTime = 0
    const scrollThrottleTime = 300 // ms between scroll events

    window.addEventListener("wheel", handleScroll, { passive: false })

    function handleScroll(e) {
        e.preventDefault()

        const now = Date.now()
        if (isAnimating || now - lastScrollTime < scrollThrottleTime) return

        lastScrollTime = now

        if (e.deltaY > 0) {
            // Scroll down - go to next page
            if (currentPage < totalPages - 1) {
                nextPage()
            }
        } else {
            // Scroll up - go to previous page
            if (currentPage > 0) {
                previousPage()
            }
        }
    }

    // Go to next page with optimized animation
    function nextPage() {
        if (currentPage >= totalPages - 1 || isAnimating) return
        isAnimating = true

        // If book is closed, open it first
        if (!isOpen) {
            openBook()
            return
        }

        const currentPageElement = document.getElementById(`page-${currentPage}`)

        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
            // Add flipped class to trigger the CSS transition
            currentPageElement.classList.add("flipped")

            // Update z-index efficiently
            updatePageZIndex()

            // Update page counter immediately for responsive UI
            currentPage++
            updatePageIndicator()

            // Reset animation flag after transition completes
            setTimeout(() => {
                isAnimating = false
            }, 600)
        })
    }

    // Go to previous page with optimized animation
    function previousPage() {
        if (currentPage <= 0 || isAnimating) return
        isAnimating = true

        currentPage--
        const currentPageElement = document.getElementById(`page-${currentPage}`)

        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
            // Remove flipped class to trigger the CSS transition
            currentPageElement.classList.remove("flipped")

            // Update z-index efficiently
            updatePageZIndex()

            // Update page indicator immediately
            updatePageIndicator()

            // If we're back to the first page, close the book after animation completes
            if (currentPage === 0) {
                setTimeout(closeBook, 600)
            }

            // Reset animation flag after transition completes
            setTimeout(() => {
                isAnimating = false
            }, 600)
        })
    }

    // Optimized z-index update
    function updatePageZIndex() {
        // Use requestAnimationFrame to batch DOM updates
        requestAnimationFrame(() => {
            for (let i = 0; i < totalPages; i++) {
                const page = document.getElementById(`page-${i}`)
                if (i < currentPage) {
                    // Pages before current page should be below
                    page.style.zIndex = i
                } else {
                    // Current and future pages should be on top in reverse order
                    page.style.zIndex = totalPages - i + currentPage
                }
            }
        })
    }

    // Open the book
    function openBook() {
        book.classList.add("open")
        isOpen = true

        // After opening animation, flip to first page
        setTimeout(() => {
            isAnimating = false
            nextPage()
        }, 300)
    }

    // Close the book
    function closeBook() {
        book.classList.remove("open")
        isOpen = false
        isAnimating = false
    }

    // Update page indicator
    function updatePageIndicator() {
        // For a book-like experience, show current page and next page (or just current if it's the last page)
        const leftPage = currentPage + 1
        const rightPage = currentPage + 2 <= totalPages ? currentPage + 2 : currentPage + 1
        currentPageElement.textContent = `${leftPage}-${rightPage}`
    }

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (isAnimating) return

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            if (currentPage < totalPages - 1) {
                nextPage()
            }
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            if (currentPage > 0) {
                previousPage()
            }
        }
    })

    // Optimized touch support for mobile devices
    let touchStartY = 0
    let touchStartTime = 0

    document.addEventListener(
        "touchstart",
        (e) => {
            touchStartY = e.touches[0].clientY
            touchStartTime = Date.now()
        },
        { passive: false },
    )

    document.addEventListener(
        "touchmove",
        (e) => {
            e.preventDefault()

            if (isAnimating) return

            const touchY = e.touches[0].clientY
            const diff = touchStartY - touchY
            const timeDiff = Date.now() - touchStartTime

            // Only process if it's a deliberate swipe (not a small movement)
            // and not too fast (to prevent accidental flips)
            if (Math.abs(diff) > 30 && timeDiff > 50 && timeDiff < 500) {
                if (diff > 0) {
                    // Swipe up - next page
                    if (currentPage < totalPages - 1) {
                        nextPage()
                    }
                } else {
                    // Swipe down - previous page
                    if (currentPage > 0) {
                        previousPage()
                    }
                }

                // Reset touch tracking
                touchStartY = touchY
                touchStartTime = Date.now()
            }
        },
        { passive: false },
    )
})
