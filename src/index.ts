import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/api/*", cors());

app.get("/", (c) => {
  return c.text("Hello!");
});

app.get("/api/tasks", async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const data = await Bun.file("data.json").text();
  const tasks = JSON.parse(data);
  return c.json(tasks);
});

app.post("/api/task", async (c) => {
  const body = await c.req.json();

  // Read the existing tasks
  const data = await Bun.file("data.json").text();
  const tasks = JSON.parse(data);

  // Find the highest existing ID and increment it
  const id = tasks.data.length + 1;
  const newTask = {
    id,
    task: body.task,
    is_complete: false,
  };

  // Add the new task
  tasks.data.push(newTask);

  // Write the updated tasks back to data.json
  await Bun.write("data.json", JSON.stringify(tasks, null, 2));

  return c.json(newTask, 201); // Return the new task with a 201 Created status
});

app.put("/api/task/:id", async (c) => {
  const body = await c.req.json();
  const param = c.req.param();
  const id = Number(param?.id);

  // Read the existing tasks
  const data = await Bun.file("data.json").text();
  const tasks = JSON.parse(data);

  // Find the highest existing ID and increment it
  const taskIndex = tasks.data.findIndex((task: any) => task.id === id);
  if (taskIndex === -1) {
    return c.json({ error: "Task not found" }, 404);
  }

  // Update the task's completed status
  tasks.data[taskIndex].is_complete = body.is_complete;

  // Write the updated tasks back to data.json
  await Bun.write("data.json", JSON.stringify(tasks, null, 2));

  return c.json(tasks.data[taskIndex]);
});

export default app;
