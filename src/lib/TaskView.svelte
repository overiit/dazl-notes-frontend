<script lang="ts">
  import { ErrorResponse, type Project, type Task } from "../utils/api";
  import API from "../utils/api";
  import ErrorMessage from "./ErrorMessage.svelte";
  import Tabs from "./Tabs.svelte";
  import TaskBar from "./TaskBar.svelte";
  import SideBar from "./SideBar.svelte";

  const ITEMS_PER_PAGE = 5;

  export let project: Project;
  export let task: Task;
  export let children: Task[] = [];
  export let onClose: () => void;
  export let viewTask: (task: Task) => void;
  let childrenPage = 0;

  enum TaskViewTabs {
    DETAILS = "Details",
    // COMMENTS = "Comments",
    EDIT = "Edit",
    // HISTORY = "History",
  }

  let creatingSubTask = false;
  let editingSubTask = false;
  let confirmingDelete = false;
  let error = "";
  let name: string, description: string;
  let taskToEdit: Task;

  async function createSubTask() {
    if (!name) {
      error = "Name is required";
      return;
    }

    const response = await API.createTask(
      project.project_id,
      name,
      description,
      task.task_id
    );
    if (response instanceof ErrorResponse) {
      error = response.message;
      return;
    }
    creatingSubTask = false;
    name = "";
    description = "";
  }

  async function deleteSubTask() {
    const response = await API.deleteTask(
      project.project_id,
      taskToEdit.task_id
    );
    if (response instanceof ErrorResponse) {
      error = response.message;
      return;
    }
    editingSubTask = false;
  }

  async function deleteTask() {
    const response = await API.deleteTask(project.project_id, task.task_id);
    if (response instanceof ErrorResponse) {
      error = response.message;
      return;
    }
    active = TaskViewTabs.DETAILS;
    confirmingDelete = false;
  }

  async function updateSubTask() {
    const { name, description } = taskToEdit;
    if (!name) {
      error = "Name is required";
      return;
    }

    const response = await API.updateTask(taskToEdit.task_id, {
      name,
      description,
    });
    if (response instanceof ErrorResponse) {
      error = response.message;
      return;
    }
    editingSubTask = false;
  }

  async function updateTask() {
    const { name, description } = taskToEdit;
    if (!name) {
      error = "Name is required";
      return;
    }

    const response = await API.updateTask(taskToEdit.task_id, {
      name,
      description,
    });
    if (response instanceof ErrorResponse) {
      error = response.message;
      return;
    }
    active = TaskViewTabs.DETAILS;
  }

  let active = "Details";
</script>

<SideBar title={task.name} scale={1.5} {onClose}>
  <Tabs
    tabs={[...Object.values(TaskViewTabs)]}
    {active}
    onTabClick={(tab) => {
      active = tab;
      confirmingDelete = false;
      error = "";

      if (active === TaskViewTabs.EDIT) {
        taskToEdit = task;
      }
    }}
  />
  <br />
  <div class="tab-view">
    {#if active === TaskViewTabs.DETAILS}
      {#if task.description && !creatingSubTask && !editingSubTask}
        <b>Description: </b>
        <pre>{task.description}</pre>
        <br />
      {/if}
      {#if !creatingSubTask && !editingSubTask}
        {#if children.length > 0}
          <div style="display: flex; flex-flow: column;height: 100%;overflow: none;overflow-y: auto; padding-right: 1rem;">
            {#each children.slice(childrenPage * ITEMS_PER_PAGE, childrenPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE) as child}
              <TaskBar
                task={child}
                viewTask={viewTask}
              />
            {/each}
          </div>
          {#if children.length > 5}
          <br>
            <Tabs
              style="margin-top: auto;"
              tabs={Array.from({ length: Math.ceil(children.length / ITEMS_PER_PAGE) },
                (_, i) => `${i + 1}`
              )}
              active={(childrenPage + 1).toString()}
              onTabClick={(tab) => {
                childrenPage = parseInt(tab) - 1;
              }}
            />
            <br />
          {/if}
        {/if}
        {#if !task.parent_id}
          <button
            class="btn primary no-3d flat"
            style="margin-bottom: .5rem;margin-top: auto;"
            on:click={() => (creatingSubTask = true)}>Create</button
          >
        {/if}
      {:else if editingSubTask}
        <div style="display: flex;">
          <button
            class="btn transparent flat smol no-3d"
            style="width: auto;"
            on:click={() => (editingSubTask = false)}
          >
            &larr; Go Back
          </button>
          <button
            class="btn btn-blocked flat smol no-3d"
            style="margin-left: auto;width:
          auto;"
            on:click={() => {
              confirmingDelete = true;
            }}
          >
            DELETE
          </button>
        </div>
        {#if !confirmingDelete}
          <br />
          <label for="taskname" class="form-label"> Name </label>
          <input
            class="input no-3d"
            type="text"
            id="taskname"
            bind:value={taskToEdit.name}
            placeholder="Build Engine"
          />
          <label for="description" class="form-label"> Description </label>
          <textarea
            class="no-3d"
            id="description"
            placeholder="Task Description"
            bind:value={taskToEdit.description}
          />
          <button
            class="btn primary flat no-3d"
            style="margin-bottom: .5rem;"
            on:click={updateSubTask}>UPDATE</button
          >
          <ErrorMessage {error} />
        {:else}
          <br />
          <label class="form-label">
            Are you sure you want to delete this task?
          </label>
          <button
            class="btn primary flat no-3d"
            style="margin-bottom: .5rem;margin-top: auto;"
            on:click={deleteSubTask}>DELETE</button
          >
          <button
            class="btn transparent flat no-3d"
            style="margin-bottom: .5rem;"
            on:click={() => {
              confirmingDelete = false;
            }}>CANCEL</button
          >
          <ErrorMessage {error} />
        {/if}
      {:else if creatingSubTask}
        <div style="display: flex;">
          <button
            class="btn transparent flat smol no-3d"
            style="width: auto;"
            on:click={() => (creatingSubTask = false)}
          >
            &larr; Go Back
          </button>
        </div>
        <br />
        <label for="taskname" class="form-label"> Name </label>
        <input
          class="input no-3d"
          type="text"
          id="taskname"
          bind:value={name}
          placeholder="Build Engine"
        />
        <label for="description" class="form-label"> Description </label>
        <textarea
          class="no-3d"
          id="description"
          placeholder="Task Description"
          bind:value={description}
        />
        <button
          class="btn primary flat no-3d"
          style="margin-bottom: .5rem;margin-top: auto;"
          on:click={createSubTask}>Create</button
        >
        <ErrorMessage {error} />
      {/if}
    {:else if active === TaskViewTabs.EDIT}
      <div style="display: flex;">
        <button
          class="btn transparent flat smol no-3d"
          style="width: auto;"
          on:click={() => (active = TaskViewTabs.DETAILS)}
        >
          &larr; Go Back
        </button>
        <button
          class="btn btn-blocked flat smol no-3d"
          style="margin-left: auto;width:
        auto;"
          on:click={() => {
            confirmingDelete = true;
          }}
        >
          DELETE
        </button>
      </div>
      {#if !confirmingDelete}
        <br />
        <label for="taskname" class="form-label"> Name </label>
        <input
          class="input no-3d"
          type="text"
          id="taskname"
          bind:value={taskToEdit.name}
          placeholder="Build Engine"
        />
        <label for="description" class="form-label"> Description </label>
        <textarea
          class="no-3d"
          id="description"
          placeholder="Task Description"
          bind:value={taskToEdit.description}
        />
        <button
          class="btn primary flat no-3d"
          style="margin-bottom: .5rem;"
          on:click={updateTask}>UPDATE</button
        >
        <ErrorMessage {error} />
      {:else}
        <br />
        <label class="form-label">
          Are you sure you want to delete this task?
        </label>
        <button
          class="btn primary flat no-3d"
          style="margin-bottom: .5rem;margin-top: auto;"
          on:click={deleteTask}>DELETE</button
        >
        <button
          class="btn transparent flat no-3d"
          style="margin-bottom: .5rem;"
          on:click={() => {
            confirmingDelete = false;
          }}>CANCEL</button
        >
        <ErrorMessage {error} />
      {/if}
    {/if}
  </div>
</SideBar>

<style lang="scss">
  input,
  textarea {
    max-width: calc(100% - 2rem);
    min-width: calc(100% - 2rem);
    margin-bottom: 1rem;
  }

  textarea {
    min-height: 50px;
    max-height: 100px;
  }

  button {
    width: 100%;
  }

  .tab-view {
    height: calc(100% - 55px);
    padding-right: 10px;
    overflow: hidden;
    overflow-y: auto;
    display: flex;
    flex-flow: column;
  }
</style>
