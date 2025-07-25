const modulesContainer = document.getElementById("modules");
const addModuleBtn = document.getElementById("addModuleBtn");
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
const exportBtn = document.getElementById("exportBtn");

let modules = JSON.parse(localStorage.getItem("modules")) || [];

function saveModules() {
  localStorage.setItem("modules", JSON.stringify(modules));
}

function renderModules() {
  modulesContainer.innerHTML = "";
  modules.forEach((mod, modIndex) => {
    const moduleEl = document.createElement("div");
    moduleEl.className = "module";

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
    deleteModuleBtn.innerHTML = "🗑️";
    deleteModuleBtn.onclick = () => {
      modules.splice(modIndex, 1);
      saveModules();
      renderModules();
    };

    headerEl.appendChild(moduleName);
    headerEl.appendChild(deleteModuleBtn);
    moduleEl.appendChild(headerEl);

    mod.tasks.forEach((task, taskIndex) => {
      const taskWrapper = document.createElement("div");
      taskWrapper.className = "task-wrapper";

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
      taskText.className = `task-text ${task.done ? "done" : ""}`;
      taskText.oninput = (e) => {
        task.text = e.target.value;
        saveModules();
      };

      const addSubtaskBtn = document.createElement("button");
      addSubtaskBtn.innerHTML = "+";
      addSubtaskBtn.onclick = () => {
        task.subtasks.push({ text: "", done: false });
        saveModules();
        renderModules();
      };

      const deleteTaskBtn = document.createElement("button");
      deleteTaskBtn.innerHTML = "❌";
      deleteTaskBtn.onclick = () => {
        mod.tasks.splice(taskIndex, 1);
        saveModules();
        renderModules();
      };

      taskEl.append(checkbox, taskText, addSubtaskBtn, deleteTaskBtn);
      taskWrapper.appendChild(taskEl);

      // Subtasks (render below)
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
        subText.className = `subtask-text ${sub.done ? "done" : ""}`;
        subText.oninput = (e) => {
          sub.text = e.target.value;
          saveModules();
        };

        subtaskEl.append(subCheck, subText);
        taskWrapper.appendChild(subtaskEl);
      });

      moduleEl.appendChild(taskWrapper);
    });

    // New task input
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
      task.subtasks.forEach((sub) => {
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
