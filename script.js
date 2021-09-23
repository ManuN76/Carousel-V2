let time = 4 * 1000;
let zoompanOption = true;

let items = document.getElementById("items");
let slides = items.getElementsByClassName("slide");
let imgs = document.querySelectorAll(".myImg");
let prev = document.getElementById("prev");
let next = document.getElementById("next");
let dots = document.getElementsByClassName("dot");
let thumbnails = document.getElementsByClassName("thumbnailImg");

let posX1 = 0;
let posX2 = 0;
let posInitial;
let posFinal;
let threshold = 100;
let slidesLength = slides.length;
let slideSize = items.getElementsByClassName("slide")[0].offsetWidth;
let index = 0;
let allowShift = true;
let dragOn = false;

let oldIndex = index;

// Init
if (dots.length > 0) {
  dots[0].classList.add("dotActive");
}
if (thumbnails.length > 0) {
  thumbnails[0].classList.add("thumbnailsActive");
}

if (!zoompanOption) {
  // Mouse and Touch events
  items.onmousedown = dragStart;

  // Touch events
  items.addEventListener("touchstart", dragStart);
  items.addEventListener("touchend", dragEnd);
  items.addEventListener("touchmove", dragAction);
  items.addEventListener("mouseout", dragEnd);
}

// Clone first and last slide
let firstSlide = slides[0];
let lastSlide = slides[slidesLength - 1];
let cloneFirst = firstSlide.cloneNode(true);
cloneFirst.childNodes[1].setAttribute("id", "-1");
let cloneLast = lastSlide.cloneNode(true);
cloneLast.childNodes[1].setAttribute("id", "-2");
items.appendChild(cloneFirst);
items.insertBefore(cloneLast, firstSlide);

// zoom pan
zoompanInit();

// Events
imgs.forEach((item, index) => {
  item.addEventListener("dblclick", function () {
    zoompanReset(index);
  });
});

prev.addEventListener("click", function () {
  shiftSlide(-1);
});

next.addEventListener("click", function () {
  shiftSlide(1);
});

// Transition events
items.addEventListener("transitionend", checkIndex);

// Windows resize
window.onresize = reportWindowSize;

function reportWindowSize() {
  window.location.reload();
}

// Automatique
let auto = setTimeout(slideauto, time);

function slideauto() {
  if (time == 0) {
    clearTimeout(auto);
  } else {
    shiftSlide(1);
    auto = setTimeout(slideauto, time);
  }
}

// Drag
function dragStart(e) {
  e = e || window.event;
  e.preventDefault();
  posInitial = items.offsetLeft;
  dragOn = true;
  if (e.type == "touchstart") {
    posX1 = e.touches[0].clientX;
  } else {
    posX1 = e.clientX;
    document.onmouseup = dragEnd;
    document.onmousemove = dragAction;
  }

  clearTimeout(auto);
}

function dragAction(e) {
  e = e || window.event;

  if (e.type == "touchmove") {
    posX2 = posX1 - e.touches[0].clientX;
    posX1 = e.touches[0].clientX;
  } else {
    posX2 = posX1 - e.clientX;
    posX1 = e.clientX;
  }
  items.style.left = items.offsetLeft - posX2 + "px";

  clearTimeout(auto);
}

function dragEnd(e) {
  if (dragOn == true) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {
      shiftSlide(1, "drag");
    } else if (posFinal - posInitial > threshold) {
      shiftSlide(-1, "drag");
    } else {
      items.style.left = posInitial + "px";
    }
  }
  document.onmouseup = null;
  document.onmousemove = null;
  dragOn = false;
}

// Show
function showSlides(n) {
  let dif = n - index;
  if (dif != 0) shiftSlide(dif);
}

// Shift
function shiftSlide(dir, action) {
  items.classList.add("shifting");

  clearTimeout(auto);

  oldIndex = index;

  if (allowShift) {
    if (!action) {
      posInitial = items.offsetLeft;
    }
    if (dir > 0) {
      items.style.left = posInitial - slideSize * dir + "px";
      index += dir;
    } else if (dir < 0) {
      items.style.left = posInitial + slideSize * Math.abs(dir) + "px";
      index += dir;
    }
  }

  allowShift = false;
}

function checkIndex() {
  clearTimeout(auto);

  zoompanReset(oldIndex);

  items.classList.remove("shifting");

  if (index < 0) {
    items.style.left = -(slidesLength * slideSize) + "px";
    index = slidesLength - 1;
  }

  if (index >= slidesLength) {
    items.style.left = -(1 * slideSize) + "px";
    index = 0;
  }

  if (dots.length > 0) {
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("dotActive");
    }
    dots[index].classList.add("dotActive");
  }

  if (thumbnails.length > 0) {
    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].classList.remove("thumbnailsActive");
    }
    thumbnails[index].classList.add("thumbnailsActive");
  }
  allowShift = true;

  auto = setTimeout(slideauto, time);
}

////////////////////////////////////////////////
//                Zoom Pan
////////////////////////////////////////////////

// Inclus
// <script src="https://unpkg.com/@panzoom/panzoom@4.4.1/dist/panzoom.min.js" />
// Source
// https://github.com/timmywil/panzoom
// Doc
// https://unpkg.com/browse/@panzoom/panzoom@4.4.1/
// Demo
// https://timmywil.com/panzoom/demo/

function zoompanInit() {
  if (zoompanOption) {
    time = 0;

    imgs.forEach((item, index) => {
      //, contain: "outside" maxScale: 5
      const panzoom = Panzoom(item, {
        maxScale: 20,
        contain: "outside",
      });
      panzoom.zoom(1.201);
      setTimeout(() => panzoom.pan(0, 0));

      // 'object-fit: fill;'
      //'object-fit: cover; cursor: move; user-select: none; touch-action: none; transform-origin: 50% 50%;'
      item.parentElement.addEventListener("wheel", panzoom.zoomWithWheel);
    });
  }
}

function zoompanReset(index) {
  if (zoompanOption) {
    const elem = imgs[index];
    elem.style = null;
    //cssText:'object-fit: cover; cursor: move; user-select: none; touch-action: none;
    //transform-origin: 50% 50%; transition: none 0s ease 0s; transform: scale(0.182684) translate(345.474px, -100.151px);'

    //const panzoom = Panzoom(elem, { maxScale: 20, contain: "outside" });
    //panzoom.reset();
    //panzoom.pan(0, 0);
    //panzoom.zoom(1, { animate: true });
  }
}
