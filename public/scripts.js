document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is authenticated before initializing the app
  fetch("/user")
    .then((response) => response.json())
    .then((data) => {
      if (data.user) {
        initializeApp();
      } else {
        window.location.href = "/login";
      }
    });

  function initializeApp() {
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("task");
    const taskList = document.getElementById("taskList");

    taskForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const taskText = taskInput.value.trim();
      if (taskText !== "") {
        addTask(taskText);
        taskInput.value = "";
      }
    });

    // Fetch tasks from the server and render them
    fetchTasks();

    function addTask(taskText) {
      const taskItem = document.createElement("li");
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteTask(taskItem.dataset.id);
      });

      taskItem.innerHTML = `<span>${taskText}</span>`;
      taskItem.appendChild(deleteButton);

      taskList.appendChild(taskItem);

      // Save task on the server
      saveTask(taskText);
    }

    function deleteTask(taskId) {
      // Delete task on the server
      fetch(`/tasks/${taskId}`, { method: "DELETE" })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const taskItem = document.querySelector(`li[data-id="${taskId}"]`);
            taskItem.remove();
          }
        });
    }

    function fetchTasks() {
      // Fetch tasks from the server
      fetch("/tasks")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            data.tasks.forEach((task) => addTask(task.text));
          }
        });
    }

    function saveTask(taskText) {
      // Save task on the server
      fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: taskText }),
      });
    }
  }
});
