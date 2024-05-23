document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.getElementById("task-list");
  const uploadForm = document.getElementById("upload-form");

  async function fetchTasks() {
    try {
      const response = await fetch("/tasks");
      const tasks = await response.json();
      taskList.innerHTML = tasks
        .map(
          ({ title, description, status, pdf }) => `
                <li>
                    ${title} - ${description} [${status}]
                    ${
                      pdf
                        ? `<a href="/uploads/${pdf}" target="_blank">View PDF</a>`
                        : ""
                    }
                </li>
            `
        )
        .join("");
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("File uploaded and processed successfully");
        fetchTasks();
      } else {
        console.error("Error uploading file");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  fetchTasks();
});
