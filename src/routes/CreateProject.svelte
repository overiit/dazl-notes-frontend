<script lang="ts">
  import Box from "../lib/Box.svelte";

  import CenteredPage from "../lib/CenteredPage.svelte";
  import ErrorMessage from "../lib/ErrorMessage.svelte";
  import { redirectTo } from "../router/Routing";
  import Auth from "../storage/auth";
  import Planner from "../storage/planner";
  import API, { ErrorResponse, type Project } from "../utils/api";
  import { getErrorMessage } from "../utils/error";

  const { session } = Auth;

  let projectName = "",
    open = false;
  let error = "";
  async function createProject() {
    error = "";
    let project: Project;
    try {
      const result = await API.createProject({
        name: projectName,
        public: open,
      });
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
    if (project) {
      redirectTo(`/@${$session.username}/${project.project_id}`);
    }
  }
</script>

<CenteredPage>
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
      <input type="checkbox" id="public" bind:checked={open} />
      <label for="public">
        Public <small>(anyone with your username can view this project)</small>
      </label>
    </div>
    <button
      on:click={createProject}
      class="btn primary no-3d"
      style="margin-top: auto;">CREATE NEW PROJECT</button
    >
    <ErrorMessage {error} />
    <br />
    <div>
      <button
        class="btn transparent flat smol no-3d"
        style="width: auto;"
        on:click={() => redirectTo("/")}
      >
        &larr; Go Back
      </button>
    </div>
  </Box>
</CenteredPage>

<style lang="scss">

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