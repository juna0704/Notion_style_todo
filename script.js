const modulesContainer = document.getElementById("modules");
const addModuleBtn = document.getElementById("addModuleBtn");
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
const exportBtn = document.getElementById("exportBtn");

let modules = JSON.parse(localStorage.getItem("modules")) || [];
// Patch legacy data for missing subtasks array
modules.forEach((mod) =>
  (mod.tasks || []).forEach((t) => {
    if (!Array.isArray(t.subtasks)) t.subtasks = [];
  })
);

function saveModules() {
  localStorage.setItem("modules", JSON.stringify(modules));
}

function renderModules() {
  modulesContainer.innerHTML = "";

  modules.forEach((mod, modIndex) => {
    const moduleEl = document.createElement("div");
    moduleEl.className = "module";
    moduleEl.draggable = true;
    moduleEl.dataset.index = modIndex;

    // Module Drag events
    moduleEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("moduleIndex", modIndex);
    });
    moduleEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      moduleEl.classList.add("dragover");
    });
    moduleEl.addEventListener("dragleave", () => {
      moduleEl.classList.remove("dragover");
    });
    moduleEl.addEventListener("drop", (e) => {
      moduleEl.classList.remove("dragover");
      const fromIndex = +e.dataTransfer.getData("moduleIndex");
      const toIndex = +moduleEl.dataset.index;
      if (fromIndex !== toIndex) {
        const [moved] = modules.splice(fromIndex, 1);
        modules.splice(toIndex, 0, moved);
        saveModules();
        renderModules();
      }
    });

    // Module header
    const headerEl = document.createElement("div");
    headerEl.className = "module-header";

    const moduleName = document.createElement("input");
    moduleName.type = "text";
    moduleName.value = mod.name;
    moduleName.className = "module-title";
    moduleName.oninput = (e) => {
      modules[modIndex].name = e.target.value;
      saveModules();
    };

    const deleteModuleBtn = document.createElement("button");
    deleteModuleBtn.className = "delete-btn";
    deleteModuleBtn.title = "Delete Module";
    deleteModuleBtn.innerHTML = "🗑️";
    deleteModuleBtn.onclick = () => {
      modules.splice(modIndex, 1);
      saveModules();
      renderModules();
    };

    headerEl.appendChild(moduleName);
    headerEl.appendChild(deleteModuleBtn);
    moduleEl.appendChild(headerEl);

    // Tasks
    mod.tasks.forEach((task, taskIndex) => {
      const taskWrapper = document.createElement("div");
      taskWrapper.className = "task-wrapper";
      taskWrapper.draggable = true;
      taskWrapper.dataset.index = taskIndex;

      // Task Drag events
      taskWrapper.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("taskFrom", taskIndex);
        e.dataTransfer.setData("moduleIndex", modIndex);
      });
      taskWrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        taskWrapper.classList.add("dragover");
      });
      taskWrapper.addEventListener("dragleave", () => {
        taskWrapper.classList.remove("dragover");
      });
      taskWrapper.addEventListener("drop", (e) => {
        taskWrapper.classList.remove("dragover");
        const from = +e.dataTransfer.getData("taskFrom");
        const moduleIdx = +e.dataTransfer.getData("moduleIndex");
        const to = +taskWrapper.dataset.index;
        if (moduleIdx === modIndex && from !== to) {
          const [movedTask] = modules[modIndex].tasks.splice(from, 1);
          modules[modIndex].tasks.splice(to, 0, movedTask);
          saveModules();
          renderModules();
        }
      });

      // Task row
      const taskEl = document.createElement("div");
      taskEl.className = "task";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.onchange = () => {
        task.done = checkbox.checked;
        saveModules();
        renderModules();
      };

      const taskText = document.createElement("input");
      taskText.type = "text";
      taskText.value = task.text;
      taskText.className = `task-text${task.done ? " done" : ""}`;
      taskText.oninput = (e) => {
        task.text = e.target.value;
        saveModules();
      };

      const addSubtaskBtn = document.createElement("button");
      addSubtaskBtn.innerHTML = "+";
      addSubtaskBtn.title = "Add Subtask";
      addSubtaskBtn.onclick = () => {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({ text: "", done: false });
        saveModules();
        renderModules();
      };

      const deleteTaskBtn = document.createElement("button");
      deleteTaskBtn.innerHTML = "❌";
      deleteTaskBtn.title = "Delete Task";
      deleteTaskBtn.onclick = () => {
        mod.tasks.splice(taskIndex, 1);
        saveModules();
        renderModules();
      };

      taskEl.append(checkbox, taskText, addSubtaskBtn, deleteTaskBtn);
      taskWrapper.appendChild(taskEl);

      // Subtasks
      task.subtasks = task.subtasks || [];
      task.subtasks.forEach((sub, subIndex) => {
        const subtaskEl = document.createElement("div");
        subtaskEl.className = "subtask";

        const subCheck = document.createElement("input");
        subCheck.type = "checkbox";
        subCheck.checked = sub.done;
        subCheck.onchange = () => {
          sub.done = subCheck.checked;
          saveModules();
          renderModules();
        };

        const subText = document.createElement("input");
        subText.type = "text";
        subText.value = sub.text;
        subText.className = `subtask-text${sub.done ? " done" : ""}`;
        subText.oninput = (e) => {
          sub.text = e.target.value;
          saveModules();
        };

        const subDelete = document.createElement("button");
        subDelete.className = "delete-btn";
        subDelete.textContent = "✖";
        subDelete.title = "Delete Subtask";
        subDelete.onclick = () => {
          task.subtasks.splice(subIndex, 1);
          saveModules();
          renderModules();
        };

        subtaskEl.append(subCheck, subText, subDelete);
        taskWrapper.appendChild(subtaskEl);
      });

      moduleEl.appendChild(taskWrapper);
    });

    // Add Task Input
    const newTaskInput = document.createElement("input");
    newTaskInput.type = "text";
    newTaskInput.placeholder = "New task...";
    newTaskInput.className = "task-input";
    newTaskInput.onkeydown = (e) => {
      if (e.key === "Enter" && newTaskInput.value.trim()) {
        mod.tasks.push({
          text: newTaskInput.value.trim(),
          done: false,
          subtasks: [],
        });
        newTaskInput.value = "";
        saveModules();
        renderModules();
      }
    };
    moduleEl.appendChild(newTaskInput);
    modulesContainer.appendChild(moduleEl);
  });
}

// Button Handlers
addModuleBtn.onclick = () => {
  modules.push({ name: "New Module", tasks: [] });
  saveModules();
  renderModules();
};
toggleThemeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};
exportBtn.onclick = () => {
  let content = "# Notion-style ToDo\n\n";
  modules.forEach((mod) => {
    content += `## ${mod.name}\n`;
    mod.tasks.forEach((task) => {
      content += `- [${task.done ? "x" : " "}] ${task.text}\n`;
      (task.subtasks || []).forEach((sub) => {
        content += `  - [${sub.done ? "x" : " "}] ${sub.text}\n`;
      });
    });
    content += "\n";
  });

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.md";
  a.click();
  URL.revokeObjectURL(url);
};

renderModules();
