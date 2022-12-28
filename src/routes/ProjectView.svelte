<script lang="ts">
  import { get } from "svelte/store";
  import Box from "../lib/Box.svelte";
  import CenteredPage from "../lib/CenteredPage.svelte";
  import ErrorMessage from "../lib/ErrorMessage.svelte";
  import Overlay from "../lib/Overlay.svelte";
  import PathBar from "../lib/PathBar.svelte";
  import TaskCard from "../lib/TaskCard.svelte";
  import TaskView from "../lib/TaskView.svelte";
  import { params, redirectTo } from "../router/Routing";
  import Auth from "../storage/auth";
  import Planner from "../storage/planner";
  import API, { ErrorResponse } from "../utils/api";
  import { getColor } from "../utils/colors";
  import { getErrorMessage } from "../utils/error";
  import SocketServer from "../utils/socket";
  import CogsIcon from "../media/cogs.svg";
  import ProjectSettings from "../lib/ProjectSettings.svelte";

  const { projectStore, userStore, taskStore, authorStore, listenersStore } = Planner;

  let newTask = false,
    taskName = "",
    taskDescription = "",
    error = "";
  let newTitle = "";

  let hasTaskView = false;

  let viewingCompleted = false;

  $: username = $params.username.substr(1);
  $: project_id = $params.project_id;
  $: task_id = $params.task_id;

  $: loadProject(username, project_id);

  let isLoading = false;
  
  async function loadProject (username: string, project_id: string) {
    if (isLoading) {
      return;
    }
    isLoading = true;
    error = "";
    try {
      const session = get(Auth.session);
      await API.user(username);
      const user = get(userStore)[username];
      await API.project(user.user_id, project_id);
      await API.tasks(project_id);
      await API.authors(project_id);
    } catch (err) {
      error = getErrorMessage(err);
    }
    isLoading = false;

  }
  
  $: project = $projectStore[project_id];
  $: project ? SocketServer.emit("project_listen", { project_id: project.project_id }) : null;

  let projectSettingsOpen = false;

  $: all = $taskStore[project_id] || [];

  $: unparented = all.filter((t) => !t.parent_id);
  $: active = unparented.filter((task) => task.status !== "COMPLETE");
  $: completed = unparented
    .filter((task) => task.status === "COMPLETE")
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  let editingTitle = false;

  $: tasks = viewingCompleted ? completed : active;
  $: taskView = all.find((task) => task.task_id === task_id);

  $: isAuthor = $authorStore[project_id]?.find((a) => a.user_id === get(Auth.session)?.user_id);

  const createTask = async () => {
    error = "";
    try {
      const result = await API.createTask(
        project.project_id,
        taskName,
        taskDescription
      );
      if (result instanceof ErrorResponse) {
        error = result.message;
      }
    } catch (err) {
      error = getErrorMessage(err);
    }
    if (error) {
      return;
    }
    taskName = "";
    taskDescription = "";
    newTask = false;
  };

  $: color1 = project ? getColor(project_id) : "#000";
  $: color2 = project ? getColor(project_id + project?.name) : "#000";
</script>
<main>
  <PathBar
    paths={[
      { name: username, to: `/@${username}` },
      { name: project?.name ?? "404" },
      ...(
        project ? [{ icon: CogsIcon, action: () => {
        projectSettingsOpen = true;
      } }]: []
      )
    ]}
  />
  <header>
    <h1
      style="--project-view-color-1: {color1}; --project-view-color-2: {color2};"
    >
      {#if project}
        {#if editingTitle && isAuthor}
          <input
            class="title inline"
            type="text"
            autofocus
            bind:value={newTitle}
            on:blur={async () => {
              editingTitle = false;
              API.updateProject(project.project_id, { name: newTitle });
            }}
            on:keydown={async (e) => {
              if (e.key === "Enter") {
                editingTitle = false;
                API.updateProject(project.project_id, { name: newTitle });
              }
            }}
          />
        {:else}
          <span
            on:dblclick={() => {
              newTitle = project.name;
              editingTitle = true;
            }}
            class={isAuthor ? "editable" : ""}
          >
            {project.name}
          </span>
        {/if}
      {:else}
        {(isLoading ? "LOADING..." : null) ?? "NOT FOUND"}
      {/if}
    </h1>
    &nbsp;
    {#if project && !isLoading}
      <div class="right">
        <button
          class="btn transparent no-3d flat {viewingCompleted ? 'active' : ''}"
          on:click={() => (viewingCompleted = !viewingCompleted)}
          >Completed ({completed.length})</button
        >
        {#if isAuthor}
          <button class="btn primary flat" on:click={() => (newTask = true)}
            >Create</button
          >
        {:else}
          <!-- <button class="btn btn-todo flat"> Propose </button> -->
        {/if}
        <!-- TODO: Profile Card -->
      </div>
    {/if}
  </header>
  {#if project}
    {#if tasks.length > 0}
      <section class="tasks">
        {#each tasks as task}
          <TaskCard
            {task}
            viewTask={(task) => {
              redirectTo(`/@${username}/${project_id}/${task.task_id}`);
            }}
          />
        {/each}
      </section>
    {:else}
      <!-- TODO: Make prettier -->
      <p>No tasks found.</p>
    {/if}
  {:else if !isLoading}
    <!-- TODO: Box? With ask for permission? -->
    <CenteredPage>
      <Box
        title="Unknown Project"
        description="We couldnt find the project you were looking for."
      >
        <p>
          If you think this is a mistake, please contact the project owner and
          ask them to add you to the project.
        </p>
        <br />
        <button
          class="btn transparent flat no-3d"
          on:click={() => redirectTo("/")}
        >
          My Projects
        </button>
      </Box>
    </CenteredPage>
  {/if}
</main>

{#if newTask}
  <Overlay onClick={() => (newTask = false)}>
    <div class="popup">
      <Box title="New Task" description="">
        <label for="name" class="form-label"> Name </label>
        <input
          class="input no-3d"
          type="text"
          id="name"
          placeholder="Build a rocket"
          bind:value={taskName}
        />

        <label for="description" class="form-label"> Description </label>
        <textarea
          class="no-3d"
          id="description"
          placeholder="Build a rocket to the moon"
          bind:value={taskDescription}
        />

        <button on:click={createTask} class="btn primary flat no-3d"
          >CREATE</button
        >

        <ErrorMessage {error} />
      </Box>
    </div>
  </Overlay>
{/if}

{#if taskView}
  <TaskView
    {project}
    onClose={() => {
      hasTaskView = false;
      redirectTo(`/@${username}/${project?.project_id ?? "404"}`)
    }}
    viewTask={(task) => {
      redirectTo(`/@${username}/${project_id}/${task.task_id}`);
    }}
    task={taskView}
    children={all.filter((task) => task.parent_id === taskView.task_id)}
  />
{/if}

{#if projectSettingsOpen}
  <Overlay
    onClick={() => {
      projectSettingsOpen = false;
    }}
  >
    <ProjectSettings {project} />
  </Overlay>
{/if}

<style lang="scss">
  header {
    display: flex;
    align-items: center;
    height: 50px;
    margin-bottom: 1rem;
    h1 {
      --project-view-color-1: #000;
      --project-view-color-2: #000;
      &,
      .inline {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 3rem;
        font-weight: 900;
        text-transform: uppercase;
      }
      .editable {
        cursor: pointer;
      }
    }
    h1 {
    }
    .right {
      margin-left: auto;
      button {
        margin-left: 1rem;
      }
    }
  }
  .tasks {
    position: relative;
    // grid with max width of 300px
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 1rem;
  }
  .popup {
    display: flex;
    justify-content: center;
    align-items: center;
    input {
      width: calc(100% - 2rem);
      margin-bottom: 1rem;
    }

    textarea {
      margin-bottom: 1rem;
      max-width: calc(100% - 2rem);
      min-width: calc(100% - 2rem);
      min-height: 50px;
      max-height: 200px;
    }

    button {
      width: 100%;
    }
  }
</style>
