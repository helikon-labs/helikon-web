import { createPopper } from "@popperjs/core";
import { Collapse, Dropdown, Modal } from "bootstrap";
import Swiper, { Mousewheel, Pagination } from "swiper";
import * as LottiePlayer from "@lottiefiles/lottie-player";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import { ScrollToPlugin } from "gsap/ScrollToPlugin.js";

// Swiper products
(function() {
  const productsCarouselEl = document.querySelector("#productsCarousel");

  if (!productsCarouselEl)
    return;

  const productsCarousel = new Swiper("#productsCarousel", {
    modules: [Mousewheel, Pagination],
    spaceBetween: 10,
    slidesPerView: 1,
    pagination: {
      el: "#productsCarousel .swiper-pagination",
      clickable: true
    },
    mousewheel: {
      forceToAxis: true,
      releaseOnEdges: true
    },
    breakpoints: {
      576: {
        slidesPerView: "auto"
      },
      768: {
        slidesPerView: "auto",
        spaceBetween: 60
      }
    }
  });
})();

// Swiper validators
(function() {
  const validatorsCarouselEl = document.querySelectorAll(".validators__carousel");

  if (!validatorsCarouselEl)
    return;

  validatorsCarouselEl.forEach((el) => {
    new Swiper(el, {
      modules: [Mousewheel, Pagination],
      spaceBetween: 10,
      slidesPerView: 1,
      pagination: {
        el: el.querySelector(".swiper-pagination"),
        clickable: true
      },
      mousewheel: {
        forceToAxis: true,
        releaseOnEdges: true
      },
      breakpoints: {
        576: {
          slidesPerView: "auto"
        },
        768: {
          slidesPerView: "auto",
          spaceBetween: 40
        },
        1200: {
          slidesPerView: "auto",
          spaceBetween: 40
        }
      }
    });
  });
})();

// Parallax
gsap.registerPlugin(ScrollTrigger);

(function() {
  const aboutEl = document.querySelector("#about");

  if (!aboutEl)
    return;

  gsap.to("#about-item-1 .about-item__content", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: {
      trigger: "#about",
      scrub: 1.5
    }
  });

  gsap.to("#about-item-2 .about-item__content", {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: "#about",
      scrub: 1.5
    }
  });

  gsap.to(".product-item__shape", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: {
      trigger: "#products",
      scrub: 1.2
    }
  });
})();

// Scroll to
gsap.registerPlugin(ScrollToPlugin);

(function() {
  function getSamePageAnchor(link) {
    if (
      link.protocol !== window.location.protocol ||
      link.host !== window.location.host ||
      link.pathname !== window.location.pathname ||
      link.search !== window.location.search
    ) {
      return false;
    }

    return link.hash;
  }

  function scrollToHash(hash, e) {
    const elem = hash ? document.querySelector(hash) : false;
    if (elem) {
      if (e) e.preventDefault();
      gsap.to(window, { duration: 1.5, scrollTo: elem, ease: "power2" });
    }
  }

  document.querySelectorAll("a[href]").forEach(a => {
    a.addEventListener("click", e => {
      scrollToHash(getSamePageAnchor(a), e);
    });
  });

  scrollToHash(window.location.hash);
})();
