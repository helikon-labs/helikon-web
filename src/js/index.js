import { createPopper } from "@popperjs/core";
import { Collapse, Dropdown, Modal } from "bootstrap";
import Swiper, { Mousewheel, Pagination } from "swiper";
import * as LottiePlayer from "@lottiefiles/lottie-player";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

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
          spaceBetween: 0
        }
      }
    });
  });
})();

// Parallax
gsap.registerPlugin(ScrollTrigger);

(function () {
  const aboutEl = document.querySelector('#about');

  if (!aboutEl)
    return

  gsap.to("#about-item-1 .about-item__content", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: {
      trigger: "#about",
      scrub: 1.5
    },
  });

  gsap.to("#about-item-2 .about-item__content", {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: "#about",
      scrub: 1.5
    },
  });

  gsap.to(".product-item__shape", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: {
      trigger: "#products",
      scrub: 1.2
    },
  });
})();
