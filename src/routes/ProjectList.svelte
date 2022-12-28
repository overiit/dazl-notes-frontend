<script lang="ts">
  import Box from "../lib/Box.svelte";
  import CenteredPage from "../lib/CenteredPage.svelte";
  import ErrorMessage from "../lib/ErrorMessage.svelte";
  import Overlay from "../lib/Overlay.svelte";
  import ProjectBar from "../lib/ProjectBar.svelte";
  import Tabs from "../lib/Tabs.svelte";
  import { redirectTo } from "../router/Routing";
  import Auth from "../storage/auth";
  import Planner from "../storage/planner";
  import API, { ErrorResponse, type Project } from "../utils/api";
  import { getErrorMessage } from "../utils/error";

  const { projectStore } = Planner;
  const { session } = Auth;

  let newProject = false;
  let projectName = "", open=false;
  let error = "";

  const PROJECTS_PER_PAGE = 10;

  async function createProject() {
    error = "";
    let project: Project;
    try {
      const result = await API.createProject({ name: projectName, public: open });
      if (result instanceof ErrorResponse) {
        error = result.message;
      } else {
        project = result.data.project;
      }
    } catch (err) {
      error = getErrorMessage(err);
    }
    if (error) {
      return;
    }
    projectName = "";
    newProject = false;
    if (project) {
      redirectTo(`/@${$session.username}/${project.project_id}`);
    }
  }
  $: user_id = $session?.user_id;
  $: projects = Object.values($projectStore).filter((project) => project.user_id === user_id);

  let projectPage = 0;
</script>

<CenteredPage>
  <Box
    title="Select Project"
    description="Pick a project you would like to plan out..."
  >
    {#if projects.length > 0}
      <div class="projects">
        {#each projects.slice(
          projectPage * PROJECTS_PER_PAGE,
          (projectPage * PROJECTS_PER_PAGE) + PROJECTS_PER_PAGE
        ) as project}
          <ProjectBar {project} />
        {/each}
      </div>
      {#if projects.length > PROJECTS_PER_PAGE}
      <Tabs
          tabs={Array.from({ length: Math.ceil(projects.length / PROJECTS_PER_PAGE) }).map((_, i) => `${i + 1}`)}
          active={(projectPage + 1).toString()}
          onTabClick={i => projectPage = parseInt(i) - 1}
        />
      {/if}
    {:else}
      <p>No projects found.</p>
    {/if}
    <hr style="margin-top: auto;" />
    <button class="btn primary no-3d" on:click={() => (newProject = true)}>
      Create New Project
    </button>
  </Box>
</CenteredPage>

{#if newProject}
  <Overlay onClick={() => (newProject = false)}>
    <div class="popup">
      <Box title="Create New Project" description="">
        <label for="name" class="form-label"> Project Name </label>
        <input
          class="input no-3d"
          type="text"
          id="name"
          placeholder="Moon Landing"
          bind:value={projectName}
        />
        <div class="public">
          <input
            type="checkbox"
            id="public"
            bind:checked={open}
          />
          <label for="public">
            Public <small>(anyone with your username can view this project)</small>
          </label>
        </div>
        <button on:click={createProject} class="btn primary flat" style="margin-top: auto;"
          >CREATE NEW PROJECT</button
        >
        <ErrorMessage {error} />
      </Box>
    </div>
  </Overlay>
{/if}

<style lang="scss">
  .projects {
    /* grid of 2 */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 1rem;
    margin-bottom: 1rem;
  }
  p {
    text-align: center;
    padding: 1rem;
    margin-bottom: 3rem;
    color: #666;
  }

  .popup {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  input[type="text"] {
    width: calc(100% - 2rem);
    margin-bottom: 1rem;
  }

  .public {
    margin-bottom: 1rem;
    label {
      font-weight: 400;
      color: #898989;
    }
  }

  button {
    width: 100%;
  }
</style>
