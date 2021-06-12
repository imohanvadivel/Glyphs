import data from "./data";

//DOM Helper functions

function $(a, b = document) {
  return b.querySelector(a);
}
function $all(a, b = document) {
  return [...b.querySelectorAll(a)];
}
function vibrate(n) {
  if (navigator.vibrate) {
    navigator.vibrate(n);
  }
}

// Unicode and Name Toggle
$("#sh-uni").onclick = toggleUnicode;
$("#sh-name").onclick = toggleName;

function toggleUnicode() {
  $("body").classList.toggle("t-uni");
  let el = $("#sh-uni");
  if (el.innerText === "Show Unicode (u)") {
    el.innerText = "Hide Unicode (u)";
  } else {
    el.innerText = "Show Unicode (u)";
  }
}
function toggleName() {
  $("body").classList.toggle("t-name");
  let el = $("#sh-name");
  if (el.innerText === "Show Name (n)") {
    el.innerText = "Hide Name (n)";
  } else {
    el.innerText = "Show Name (n)";
  }
}

function captalize(str) {
  if (!str) return;
  let ary = str.split(" ");
  let fary = ary.map((e) => caps(e));
  return fary.join(" ");

  function caps(str) {
    if (!str.length) return "";
    let ary = str.split("");
    let firstChar = ary[0].toUpperCase();
    ary.splice(0, 1, firstChar);
    return ary.join("");
  }
}

// Adding element to Dom
function renderDOM(data) {
  data.forEach((d) => {
    let id = d.id;
    let heading = `<h4 class="header" span="row">${d.name}</h4>`;

    let secdata = d.data.map((e, i) => {
      const longText = () => {
        if (e[1].length > 17) return "long-text";
        return "short-text";
      };

      let uni = e[0].toUpperCase();
      let uniCode = `U+${uni}`;
      let name = captalize(e[1]);

      return `
      <section data-glyph="&#x${uni};" data-unicode="${uniCode}" data-name="${name}" title="&#x${uni};  [${uniCode}]  ${name}">
          <div class="unicode text-center xxsmall">${uniCode}</div>
          <div class="icn flex text-center">&#x${uni};</div>
          <div class="name text-center ${longText()} ">${name}</div>
      </section>`;
    });

    $("main").insertAdjacentHTML(
      "beforeend",
      `${heading}
    <div id="${id}" class="table" span="row">
    ${secdata.join("")}
    </div>
    `
    );
  });
}
renderDOM(data);

function clearDOM() {
  $all(".header").forEach((e) => e.remove());
  $all(".table").forEach((e) => e.remove());
  if ($(".empty-state")) $(".empty-state").remove();
}

// Tab Index
$all(".table section").forEach((e, i) => e.setAttribute("tabindex", i + 6));

// ClipBoard
window.onmousedown = (e) => {
  let el = e.target.closest("section");
  if (!el) return;
  if (e.shiftKey) {
    copyUnicode(el);
  } else {
    copyGlyph(el);
  }
};

function copyGlyph(el, keyboard) {
  vibrate(4);
  let glyph = el.getAttribute("data-glyph");
  let name = el.getAttribute("data-name");
  el.classList.add("sel");

  navigator.clipboard.writeText(glyph);

  if (el.closest("#space")) {
    toastMessage(`Copied  ${name}  to clipboard`);
  } else {
    toastMessage(`Copied  ${glyph}  to clipboard`);
  }

  if (!keyboard) {
    window.onmouseup = clearClass;

    el.blur();
  } else {
    setTimeout(clearClass, 150);
  }

  function clearClass() {
    return el.classList.remove("sel");
  }
}

function copyUnicode(el, keyboard) {
  vibrate(4);
  let unicode = el.getAttribute("data-unicode");
  el.classList.add("sel");

  navigator.clipboard.writeText(unicode);
  toastMessage(`Copied ${unicode} to clipboard`);

  if (!keyboard) {
    window.onmouseup = clearClass;
  } else {
    setTimeout(clearClass, 150);
  }

  function clearClass() {
    return el.classList.remove("sel");
  }
}

function toastMessage(msg, Delay) {
  $(".toast .msg").innerText = msg;
  $(".toast").classList.add("active");
  let delay = Delay || 2500;
  setTimeout(() => $(".toast").classList.remove("active"), delay);
}

// Search Function ==========================

//bruteforce injection to DOM
// No need to diff
let searchBar = $(".search-bar");
let input = $(".search-bar input");
input.onfocus = () => {
  searchBar.classList.add("active");
  $(".close-icon").classList.add("active");
};
input.onblur = () => {
  console.log("sl");
  searchBar.classList.remove("active");
  if (!input.value) {
    $(".close-icon").classList.remove("active");
    if (searchBar.classList.contains("disp"))
      searchBar.classList.remove("disp");
  }
};

input.oninput = () => filter(input.value);

function filter(str) {
  let newData = [];
  data.forEach((d) => {
    let ary = d.data.filter(
      (f) => matchRegEx(`U+${f[0]}`, str) || matchRegEx(f[1], str)
    );
    if (ary.length > 0) newData.push({ ...d, data: ary });
  });
  clearDOM();
  if (newData.length === 0) addEmptyState();
  else renderDOM(newData);
}
function matchRegEx(data, inp) {
  let inp1 = inp.replace(/\+/, "\\+");
  let re = new RegExp(inp1, "i");
  return re.test(data);
}
$(".close-icon").onclick = () => {
  vibrate(8);
  input.value = "";
  $(".close-icon").classList.remove("active");
  if (searchBar.classList.contains("disp")) searchBar.classList.remove("disp");
  clearDOM();
  renderDOM(data);
};

function addEmptyState() {
  $("body").insertAdjacentHTML(
    "beforeend",
    `
  <div class="empty-state h-10 flex text-center">No Glyphs Found!</div>
  `
  );
}

// Responsive Search
$("#min-search").onclick = () => {
  vibrate(12);
  searchBar.classList.add("disp");
  input.focus();
};

// Dark Mode
class DarkMode {
  constructor(el, namespace, setMetaTheme) {
    this.root = document.querySelector("html");
    if (namespace) this.namespace = namespace;
    if (setMetaTheme) this.setMetaTheme = setMetaTheme;
    this.label = "darkMode";
    this.InitializeTheme();
    el.addEventListener("click", () => this.toggleTheme());
  }

  InitializeTheme() {
    if (this.namespace) this.label = `${this.namespace}-darkMode`;
    let theme = localStorage.getItem(this.label);

    if (theme === "false" || theme == null) {
      this.setLightMode();
      if (this.setMetaTheme) this.setMeta("light");
    } else {
      this.setDarkMode();
      if (this.setMetaTheme) this.setMeta("dark");
    }
  }

  setMeta(theme) {
    let meta = document.querySelector('html meta[name="theme-color"]');
    if (!meta) {
      let meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document
        .querySelector("head")
        .insertAdjacentHTML(
          "beforeend",
          `<meta name="theme-color" content="${
            theme === "dark" ? "#191919" : "#ffffff"
          }" />`
        );
      return;
    }

    meta.insertAdjacentHTML(
      "afterend",
      `<meta name="theme-color" content="${
        theme === "dark" ? "#191919" : "#ffffff"
      }" />`
    );
    meta.remove();
  }

  toggleTheme() {
    let theme = localStorage.getItem(this.label);
    if (theme === "false") {
      this.setDarkMode();
      if (this.setMetaTheme) this.setMeta("dark");
    } else {
      this.setLightMode();
      if (this.setMetaTheme) this.setMeta("light");
    }
  }

  setDarkMode() {
    this.root.classList.add("dark");
    localStorage.setItem(this.label, true);
    if (this.setMetaTheme) this.setMeta("dark");
  }

  setLightMode() {
    this.root.classList.remove("dark");
    localStorage.setItem(this.label, false);
    if (this.setMetaTheme) this.setMeta("light");
  }
}

new DarkMode($("#darkMode-toggle"), "glyphs", true);

//Keyevent listener
window.addEventListener("keydown", (e) => {
  if (!document.activeElement.closest(".search-bar")) {
    if (e.keyCode === 85) toggleUnicode();
    if (e.keyCode === 78) toggleName();
  }
  if (e.keyCode === 13 && document.activeElement.closest("section")) {
    if (e.shiftKey) {
      copyUnicode(e.path[0], true);
    } else {
      copyGlyph(e.path[0], true);
    }
  }
  if (e.keyCode === 191) {
    e.preventDefault();
    $(".search-bar input").focus();
  }
});
