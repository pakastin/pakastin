const monthNames = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const $pagesContainer = document.querySelector(".pages");
const $date = document.querySelector(".date");
const $time = document.querySelector(".time");
const $teletext = document.querySelector(".teletext");
const $pageScan = document.querySelector(".page-scan");
const $currentPage = document.querySelector(".page-current");
const $weather = document.querySelector(".weather");
let targetPage = 100;
let currentPage = "";
let searchPage = "";
let searchTime = 0;
let pageScan = 0;
let scanStart = 0;
const notFound = {};
const allowedCharacters = "0123456789";

const scanSpeed = 1.25;
const loadingPages = { 100: function () {} };

render();
resize();

window.addEventListener("hashchange", hashChange);
window.addEventListener("resize", resize);

hashChange(true);

function hashChange(initial) {
  const page = location.hash.slice(1);

  if (page >= 100 && page <= 999) {
    targetPage = Number(page);
  } else {
    targetPage = 100;
  }
  searchPage = "";
  pageScan = 0;
}

function render() {
  requestAnimationFrame(render);

  if (targetPage) {
    if (!searchTime) {
      searchTime = Date.now();
    }
    $currentPage.textContent = targetPage;

    if (!loadingPages[targetPage]) {
      loadingPages[targetPage] = fetch(`pages/${targetPage}.html`, {
        cache: "no-store",
      }).then(async (res) => {
        if (res.ok) {
          const $page = document.createElement("div");
          $page.className = `page page-${targetPage}`;
          $page.innerHTML = await res.text();
          $page.style.display = "none";
          $pagesContainer.appendChild($page);
        } else {
          if (res.status === 404) {
            notFound[targetPage] = true;
          } else if (res.status !== 404) {
            setTimeout(() => {
              loadingPages[targetPage] = null;
            }, 1000);
          }
        }
      });
    }

    if (!pageScan) {
      pageScan = (Date.now() % 900) + 100;
      scanStart = pageScan;
    }

    if (pageScan > 900) {
      scanStart = 100;
    }

    const currentScan = (pageScan % 900) + 100;

    if (
      (scanStart <= targetPage && targetPage <= currentScan) ||
      pageScan - scanStart > 1800
    ) {
      if (notFound[targetPage]) {
        getPage(404);
        currentPage = targetPage;
        targetPage = 0;
        searchTime = 0;
      }
      if (getPage(targetPage)) {
        currentPage = targetPage;
        targetPage = 0;
        searchTime = 0;
      }
    }

    pageScan += 10 + Math.floor(Math.random() * 10);

    $pageScan.textContent = currentScan;

    $pageScan.classList.add("magenta");
  } else {
    $pageScan.textContent = currentPage;
    $pageScan.classList.remove("magenta");
    pageScan = 0;
  }
  if (searchPage) {
    if (searchPage.length < 3) {
      $currentPage.textContent = searchPage.padEnd(3, "-");
    } else {
      $currentPage.textContent = searchPage;
      location.hash = `#${searchPage}`;
      searchPage = "";
    }
  }
}

tick();

function tick() {
  const nextTick = (1000 - Date.now()) % 1000;
  setTimeout(tick, nextTick);

  const date = new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const mon = monthNames[date.getMonth()];
  const year = date.getFullYear();
  $date.textContent = `${day} ${mon} ${year}`;

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  $time.textContent = `${hh}:${mm}:${ss}`;
}

function resize() {
  const scale =
    Math.min(window.innerHeight / 26, window.innerWidth / (42 * 0.6)) / 16;
  $teletext.style.transform = `translate(-50%, 0) scale(${scale})`;
  $teletext.style.transformOrigin = "50% 0";
}

function getPage(page) {
  const $pages = document.querySelectorAll(".page");
  const $targetPage = document.body.querySelector(`.page-${page}`);

  if ($targetPage) {
    for (let i = 0; i < $pages.length; i++) {
      if ($pages[i].classList.contains(`page-${page}`)) {
        $pages[i].style.display = "";
      } else {
        $pages[i].style.display = "none";
      }
    }
    return true;
  }
}

getWeather();

async function getWeather() {
  const { properties } = await fetch(
    "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=61.49911&lon=23.78712",
  ).then((res) => res.json());

  const { air_temperature, wind_speed } =
    properties.timeseries[0].data.instant.details;
  $weather.innerHTML = `Tampere, Finland ${humanTemp(air_temperature)} (${humanWind(wind_speed)})`;
}

function humanTemp(temp) {
  if (temp < 0) {
    return `<span class="cyan">${temp}°C</span>`;
  } else {
    return `<span class="yellow">+${temp}°C</span>`;
  }
}

function humanWind(wind) {
  return `${wind} m/s`;
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    targetPage = (((targetPage || currentPage || 100) - 100 + 1) % 900) + 100;
    pageScan = 0;
  } else if (e.key === "ArrowLeft") {
    targetPage = (((targetPage || currentPage || 100) - 100 - 1) % 900) + 100;
    if (targetPage < 100) {
      targetPage += 900;
    }
    pageScan = 0;
  }
});

window.addEventListener("keypress", (e) => {
  if (allowedCharacters.includes(e.key)) {
    if (searchPage.length < 1 && e.key < 1) {
      return;
    }
    searchPage += e.key;
  }
});
