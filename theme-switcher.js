// Theme switcher functionality
class ThemeSwitcher {
  constructor() {
    // Check for localStorage first, then system preference, default to light
    this.theme =
      localStorage.getItem("theme") || this.getSystemPreference() || "light";
    this.init();
  }

  // Detect system preference for dark mode
  getSystemPreference() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return null;
  }

  init() {
    // Set initial theme
    this.setTheme(this.theme);

    // Set up theme switcher when DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupEventListeners();
      });
    } else {
      // DOM already loaded
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Add event listeners to all theme switcher buttons
    const switchers = document.querySelectorAll(".theme-switcher");
    switchers.forEach((switcher) => {
      switcher.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click from bubbling up
        this.toggleTheme();
      });
    });

    // Listen for system theme changes
    this.listenForSystemThemeChanges();
  }

  // Listen for changes in system color scheme preference
  listenForSystemThemeChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      try {
        // Modern approach with addEventListener
        mediaQuery.addEventListener("change", (e) => {
          // Only apply system preference if user hasn't manually set a theme
          if (!localStorage.getItem("theme")) {
            this.setTheme(e.matches ? "dark" : "light");
          }
        });
      } catch (err) {
        // Fallback for older browsers
        mediaQuery.addListener((e) => {
          if (!localStorage.getItem("theme")) {
            this.setTheme(e.matches ? "dark" : "light");
          }
        });
      }
    }
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update SVG visibility based on theme
    this.updateSvgIcons();
  }

  // Update the SVG icons based on current theme
  updateSvgIcons() {
    // Force a repaint to ensure smooth transitions
    document.documentElement.style.transition = "none";
    document.documentElement.offsetHeight; // Trigger reflow
    document.documentElement.style.transition = "";
  }

  toggleTheme() {
    const newTheme = this.theme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }
}

// Mobile menu functionality
class MobileMenu {
  constructor() {
    // Set up mobile menu when DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.init();
      });
    } else {
      // DOM already loaded
      this.init();
    }
  }

  init() {
    // Cache DOM elements
    this.hamburgers = document.querySelectorAll(".hamburger");
    this.navLinks = document.querySelectorAll(".nav-links");
    this.navLinkItems = document.querySelectorAll(".nav-links a");

    this.setupEventListeners();
    this.updateActiveNavLinks();
  }

  setupEventListeners() {
    // Hamburger menu toggle
    this.hamburgers.forEach((hamburger) => {
      hamburger.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent bubbling to document
        this.toggleMenu();
      });
    });

    // Close menu when clicking on links
    this.navLinkItems.forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".hamburger") && !e.target.closest(".nav-links")) {
        this.closeMenu();
      }
    });

    // Close menu when pressing Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeMenu();
      }
    });

    // Handle window resize - close mobile menu if window is resized beyond mobile breakpoint
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    const isActive = this.hamburgers[0]?.classList.contains("active");

    if (isActive) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.hamburgers.forEach((hamburger) => {
      hamburger.classList.add("active");
    });
    this.navLinks.forEach((nav) => {
      nav.classList.add("active");
    });

    // Prevent body scrolling when menu is open
    document.body.style.overflow = "hidden";
  }

  closeMenu() {
    this.hamburgers.forEach((hamburger) => {
      hamburger.classList.remove("active");
    });
    this.navLinks.forEach((nav) => {
      nav.classList.remove("active");
    });

    // Restore body scrolling
    document.body.style.overflow = "";
  }

  updateActiveNavLinks() {
    const currentPath = window.location.pathname;

    this.navLinkItems.forEach((link) => {
      // Remove any existing active class first
      link.classList.remove("active");

      try {
        // Get the link's path
        const linkPath = new URL(link.href).pathname;

        // Handle root path and index.html special cases
        if (
          (currentPath === "/" || currentPath === "/index.html") &&
          (linkPath === "/" || linkPath === "/index.html")
        ) {
          link.classList.add("active");
        }
        // Handle blog path special case
        else if (
          currentPath.includes("/blogs/") &&
          linkPath.includes("/blogs/")
        ) {
          // Only highlight the blog nav item
          if (
            linkPath.endsWith("/blogs/index.html") ||
            linkPath.endsWith("/blogs/")
          ) {
            link.classList.add("active");
          }
        }
        // Handle profile/about page
        else if (
          currentPath.includes("/profile.html") &&
          linkPath.includes("/profile.html")
        ) {
          link.classList.add("active");
        }
        // Handle exact matches
        else if (currentPath === linkPath) {
          link.classList.add("active");
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    });
  }
}

// Smooth scrolling functionality
class SmoothScroll {
  constructor() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  init() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");

        // Skip if it's just "#" (empty anchor)
        if (targetId === "#") return;

        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }
}

// Initialize all components
document.addEventListener("DOMContentLoaded", function () {
  // Initialize in specific order to ensure proper behavior
  new ThemeSwitcher();
  new MobileMenu();
  new SmoothScroll();
});

// Pre-initialize theme to prevent FOUC (Flash of Unstyled Content)
(function () {
  // Get theme from localStorage or use default
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
