import { createPopper } from "@popperjs/core";
import { Collapse, Dropdown, Modal } from "bootstrap";
import Swiper, { FreeMode, Pagination } from "swiper";
import * as LottiePlayer from "@lottiefiles/lottie-player";

// Swiper products
(function() {
  const productsCarouselEl = document.querySelector("#productsCarousel");

  if (!productsCarouselEl)
    return;

  const productsCarousel = new Swiper("#productsCarousel", {
    modules: [Pagination, FreeMode],
    spaceBetween: 10,
    slidesPerView: 1,
    pagination: {
      el: "#productsCarousel .swiper-pagination",
      clickable: true
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
      modules: [Pagination, FreeMode],
      spaceBetween: 10,
      slidesPerView: 1,
      pagination: {
        el: el.querySelector(".swiper-pagination"),
        clickable: true
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
  })
})();
