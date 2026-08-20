const STORAGE_KEY = "task-flow-tasks";

let tasks = loadTasks();
let currentIndex = 0;

const listView = document.getElementById("listView");
const runView = document.getElementById("runView");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const startBtn = document.getElementById("startBtn");
const currentTask = document.getElementById("currentTask");
const doneBtn = document.getElementById("doneBtn");
const exitBtn = document.getElementById("exitBtn");

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data.filter(t => typeof t === "string" && t.trim()) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  emptyState.classList.toggle("hidden", tasks.length !== 0);

  tasks.forEach((task, index) => {
    const row = document.createElement("div");
    row.className = "task";

    const input = document.createElement("input");
    input.value = task;
    input.maxLength = 200;
    input.setAttribute("aria-label", `Task ${index + 1}`);

    input.addEventListener("change", () => {
      const value = input.value.trim();
      if (value) {
        tasks[index] = value;
        saveTasks();
        renderTasks();
      } else {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete task ${index + 1}`);
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    row.append(input, deleteBtn);
    taskList.appendChild(row);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  tasks.push(value);
  saveTasks();
  taskInput.value = "";
  renderTasks();
  taskInput.focus();
});

startBtn.addEventListener("click", () => {
  if (!tasks.length) return;
  currentIndex = 0;
  showCurrentTask();
  listView.classList.add("hidden");
  runView.classList.remove("hidden");
});

function showCurrentTask() {
  currentTask.textContent = tasks[currentIndex] ?? "";
}

doneBtn.addEventListener("click", () => {
  currentIndex += 1;

  if (currentIndex >= tasks.length) {
    currentTask.textContent = "All done!";
    doneBtn.disabled = true;
    setTimeout(() => {
      doneBtn.disabled = false;
      runView.classList.add("hidden");
      listView.classList.remove("hidden");
      renderTasks();
    }, 700);
    return;
  }

  showCurrentTask();
});

exitBtn.addEventListener("click", () => {
  runView.classList.add("hidden");
  listView.classList.remove("hidden");
});

renderTasks();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
