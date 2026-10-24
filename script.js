// ---------- Element references ----------
const toDo = document.querySelector("#to-do");
const process = document.querySelector("#process");
const done = document.querySelector("#done");

const addTask = document.querySelector("#addTask");
const footer = document.querySelector(".footer");
const createBtn = document.querySelector("#create");

const input1 = document.querySelector("#input1"); // title
const input2 = document.querySelector("#input2"); // description

let dragElement = null;

// Map column ids -> actual DOM elements (for save/load)
const columns = { "to-do": toDo, "process": process, "done": done };

// ---------- Create a task card (reused for load + new task) ----------
function createTaskElement(title, desc) {
  const task = document.createElement("div");
  task.draggable = true;
  task.classList.add("tasks");

  const titleDiv = document.createElement("div");
  const h3 = document.createElement("h3");
  h3.textContent = title;
  titleDiv.appendChild(h3);

  const p = document.createElement("p");
  p.textContent = desc;

  const buttonDiv = document.createElement("div");
  buttonDiv.classList.add("button");

  const button = document.createElement("button");
  button.textContent = "delete";
  button.addEventListener("click", () => {
    task.remove();
    updateCounts();
    saveTasks();
  });

  buttonDiv.appendChild(button);

  task.appendChild(titleDiv);
  task.appendChild(p);
  task.appendChild(buttonDiv);

  addDragEvents(task);
  return task;
}

// ---------- Drag events for a task ----------
function addDragEvents(task) {
  task.addEventListener("dragstart", () => {
    dragElement = task;
    setTimeout(() => task.classList.add("dragging"), 0);
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
    dragElement = null;
  });
}

// ---------- Drop-zone (column) events ----------
function addDragBox(box) {
  box.addEventListener("dragover", (e) => e.preventDefault());

  box.addEventListener("dragenter", (e) => {
    e.preventDefault();
    box.classList.add("active");
  });

  box.addEventListener("dragleave", () => box.classList.remove("active"));

  box.addEventListener("drop", (e) => {
    e.preventDefault();
    box.classList.remove("active");

    if (dragElement) {
      box.appendChild(dragElement);
    }

    updateCounts();
    saveTasks();
  });
}

[toDo, process, done].forEach(addDragBox);

// ---------- Counts ----------
function updateCounts() {
  [toDo, process, done].forEach((col) => {
    const taskEls = col.querySelectorAll(".tasks");
    const count = col.querySelector(".right");
    if (count) count.textContent = taskEls.length;
  });
}

// ---------- Save current board state to localStorage ----------
function saveTasks() {
  const data = {};
  for (const colId in columns) {
    const col = columns[colId];
    const taskEls = col.querySelectorAll(".tasks");
    data[colId] = Array.from(taskEls).map((task) => ({
      title: task.querySelector("h3").textContent,
      desc: task.querySelector("p").textContent,
    }));
  }
  localStorage.setItem("tasks", JSON.stringify(data));
}

// ---------- Load tasks from localStorage on page start ----------
function loadTasks() {
  const raw = localStorage.getItem("tasks");
  if (!raw) return;

  const data = JSON.parse(raw);
  for (const colId in data) {
    const col = columns[colId];
    if (!col) continue;
    data[colId].forEach(({ title, desc }) => {
      const task = createTaskElement(title, desc);
      col.appendChild(task);
    });
  }
  updateCounts();
}

loadTasks();

// ---------- Add task modal open ----------
addTask.addEventListener("click", () => {
  footer.style.display = "block";
});

// ---------- Create new task ----------
createBtn.addEventListener("click", () => {
  const title = input1.value.trim();
  const desc = input2.value.trim();
  if (!title) return; // basic guard: empty title pe task mat banao

  const task = createTaskElement(title, desc);
  toDo.appendChild(task);

  updateCounts();
  saveTasks();

  // form reset + close
  input1.value = "";
  input2.value = "";
  footer.style.display = "none";
});