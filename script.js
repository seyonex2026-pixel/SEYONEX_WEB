// Keep the compact header readable after the page begins scrolling.
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const processSection = document.querySelector(".process-section");
const enquiryForm = document.querySelector(".enquiry-form");
const heroVideo = document.querySelector(".hero-video");
const smartHomeVideo = document.querySelector(".smart-home-video");
const healthcareVideo = document.querySelector(".healthcare-video");
const agricultureVideo = document.querySelector(".agriculture-video");
const industrialVideo = document.querySelector(".industrial-video");
const safetyVideo = document.querySelector(".safety-video");
const environmentVideo = document.querySelector(".environment-video");
const institutionsVideo = document.querySelector(".institutions-video");
const decorativeVideos = document.querySelectorAll(".decorative-video:not(.hero-video):not(.smart-home-video):not(.healthcare-video):not(.agriculture-video):not(.industrial-video):not(.safety-video):not(.environment-video):not(.institutions-video)");
const sectionNavLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
const solutionSectionIds = new Set(["smart-home", "healthcare", "agriculture", "industrial", "safety", "environment", "institutions"]);

function closeMobileMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("is-open");
}

function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 20);
}

function updateActiveNavigation() {
    if (!sectionNavLinks.length) return;

    const readingLine = header.offsetHeight + (window.innerHeight * 0.32);
    let activeId = "home";
    const navigationSections = sectionNavLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean)
        .sort((first, second) => first.offsetTop - second.offsetTop);

    navigationSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= readingLine) activeId = section.id;
    });

    const activeLinkId = solutionSectionIds.has(activeId) ? "smart-home" : activeId;
    sectionNavLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeLinkId}`;
        link.classList.toggle("is-active", isActive);
        link.toggleAttribute("aria-current", isActive);
    });
}

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navLinks.classList.toggle("is-open", !isOpen);
});

navLinks.addEventListener("click", () => {
    closeMobileMenu();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
        closeMobileMenu();
        menuToggle.focus();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});

window.addEventListener("scroll", () => {
    updateHeader();
    updateActiveNavigation();
}, { passive: true });
updateHeader();
updateActiveNavigation();

// Let each solution film establish itself before its overlay copy appears.
// The class is added only with JavaScript, so the copy remains visible as a safe fallback.
const delayedVideoCopies = document.querySelectorAll("[data-video-copy-delay]");
const reduceVideoCopyMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

delayedVideoCopies.forEach((copy) => {
    const delay = Number(copy.dataset.videoCopyDelay) || 1600;
    let timer;
    let hasRevealed = false;

    if (reduceVideoCopyMotion.matches || !("IntersectionObserver" in window)) return;

    const revealCopy = () => {
        if (hasRevealed) return;
        hasRevealed = true;
        window.clearTimeout(timer);
        copy.classList.remove("video-copy-is-waiting");
        copy.classList.add("video-copy-is-revealed");
    };

    const copyObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;

        copy.classList.add("video-copy-is-waiting");
        timer = window.setTimeout(revealCopy, delay);
        observer.unobserve(copy);
    }, { threshold: 0.25 });

    copyObserver.observe(copy);
});

// Turn scroll position within the process section into a mountain-journey state.
if (processSection) {
    const processStages = [...processSection.querySelectorAll(".process-stage")];
    const processProgressValue = processSection.querySelector("[data-process-progress]");
    const reduceProcessMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let processFrame;

    const updateProcessJourney = () => {
        processFrame = undefined;

        if (reduceProcessMotion.matches) {
            processSection.style.setProperty("--journey-progress", "100");
            processProgressValue.textContent = "100%";
            processStages.forEach((stage) => stage.classList.add("is-complete"));
            return;
        }

        const bounds = processSection.getBoundingClientRect();
        const scrollDistance = Math.max(processSection.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(1, Math.max(0, -bounds.top / scrollDistance));
        const activeIndex = Math.min(processStages.length - 1, Math.floor(progress * processStages.length));

        processSection.style.setProperty("--journey-progress", String(progress * 100));
        processProgressValue.textContent = `${Math.round(progress * 100)}%`;
        processStages.forEach((stage, index) => {
            stage.classList.toggle("is-active", index === activeIndex);
            stage.classList.toggle("is-complete", index < activeIndex);
        });
    };

    const requestProcessUpdate = () => {
        if (!processFrame) {
            processFrame = window.requestAnimationFrame(updateProcessJourney);
        }
    };

    window.addEventListener("scroll", requestProcessUpdate, { passive: true });
    window.addEventListener("resize", requestProcessUpdate);
    updateProcessJourney();

    if (typeof reduceProcessMotion.addEventListener === "function") {
        reduceProcessMotion.addEventListener("change", requestProcessUpdate);
    }
}

// The enquiry form is intentionally front-end only until a submission service is connected.
if (enquiryForm) {
    const formFeedback = enquiryForm.querySelector(".form-feedback");

    enquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        formFeedback.textContent = "Thank you. Form submission will be connected soon.";
        enquiryForm.reset();
    });
}

// Domain videos play only while nearby and remain paused for reduced-motion users.
if (decorativeVideos.length) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
        decorativeVideos.forEach((video) => video.pause());
    } else if ("IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(({ isIntersecting, target }) => {
                if (isIntersecting) {
                    target.play().catch(() => {});
                } else {
                    target.pause();
                }
            });
        }, { rootMargin: "200px 0px" });

        decorativeVideos.forEach((video) => videoObserver.observe(video));
    }
}

// The hero video also pauses when the tab is hidden and resumes only when visible.
if (heroVideo) {
    const heroReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let heroIsVisible = true;

    const syncHeroVideo = () => {
        if (heroReducedMotion.matches || document.hidden || !heroIsVisible) {
            heroVideo.pause();
        } else {
            heroVideo.play().catch(() => {});
        }
    };

    if ("IntersectionObserver" in window) {
        const heroObserver = new IntersectionObserver((entries) => {
            heroIsVisible = entries[0].isIntersecting;
            syncHeroVideo();
        }, { rootMargin: "100px 0px" });

        heroObserver.observe(heroVideo);
    }

    document.addEventListener("visibilitychange", syncHeroVideo);
    heroReducedMotion.addEventListener("change", syncHeroVideo);
    syncHeroVideo();
}

// Solution films load and play only as the visitor approaches each slide.
const domainVideos = document.querySelectorAll(".domain-video");
if (domainVideos.length) {
    const domainReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (domainReducedMotion.matches) {
        domainVideos.forEach((video) => video.pause());
    } else if ("IntersectionObserver" in window) {
        const domainVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(({ isIntersecting, target }) => {
                if (isIntersecting && !document.hidden) {
                    target.play().catch(() => {});
                } else {
                    target.pause();
                }
            });
        }, { rootMargin: "240px 0px", threshold: 0.05 });

        domainVideos.forEach((video) => {
            video.pause();
            domainVideoObserver.observe(video);
        });
    }
}
