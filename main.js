const monthNames = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const $pagesContainer = document.querySelector(".pages");
const $date = document.querySelector(".date");
const $time = document.querySelector(".time");
const $pageScan = document.querySelector(".page-scan");
const $currentPage = document.querySelector(".page-current");
let targetPage = 100;
let currentPage = "";
let lastScan = 1000;
const scanSpeed = 1.5;
const loadingPages = { 100: function () {} };

render();
resize();

window.addEventListener("hashchange", hashChange);
window.addEventListener("resize", resize);

hashChange(true);

function hashChange(initial) {
  var page = location.hash.slice(1);

  if (page >= 100 && page < 999) {
    targetPage = page;
  }
}

function render() {
  requestAnimationFrame(render);

  if (targetPage) {
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
          if (res.status !== 404) {
            setTimeout(() => {
              loadingPages[targetPage] = null;
            }, 1000);
          }
        }
      });
    }

    var pageScan = (Math.floor(Date.now() / scanSpeed) % 890) + 100;

    if (lastScan <= targetPage && pageScan >= targetPage) {
      if (getPage(targetPage)) {
        currentPage = targetPage;
        pageScan = currentPage;
        $currentPage.textContent = currentPage;
        targetPage = "";
      }
    }

    $pageScan.textContent = pageScan;

    if (lastScan > pageScan && lastScan < 1000) {
      lastScan = 0;
    } else {
      lastScan = pageScan - 1;
    }
  } else {
    $pageScan.textContent = currentPage;
    lastScan = 1000;
  }
}

tick();

function tick() {
  var nextTick = (1000 - Date.now()) % 1000;
  setTimeout(tick, nextTick);

  var date = new Date();

  var day = String(date.getDate()).padStart(2, "0");
  var mon = monthNames[date.getMonth()];
  var year = date.getFullYear();
  $date.textContent = `${day} ${mon} ${year}`;

  var hh = String(date.getHours()).padStart(2, "0");
  var mm = String(date.getMinutes()).padStart(2, "0");
  var ss = String(date.getSeconds()).padStart(2, "0");
  $time.textContent = `${hh}:${mm}:${ss}`;
}

function resize() {
  var fontSize =
    Math.min(window.innerHeight / 26, window.innerWidth / (42 * 0.6)) + "px";
  document.body.style.fontSize = fontSize;
}

function getPage(page) {
  var $pages = document.querySelectorAll(".page");
  var $targetPage = document.body.querySelector(`.page-${page}`);

  if ($targetPage) {
    for (var i = 0; i < $pages.length; i++) {
      if ($pages[i].classList.contains(`page-${page}`)) {
        $pages[i].style.display = "";
      } else {
        $pages[i].style.display = "none";
      }
    }
    return true;
  } else {
    targetPage = "404";
  }
}
