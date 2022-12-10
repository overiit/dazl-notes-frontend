<script lang="ts">
  import { get } from "svelte/store";
  import ErrorMessage from "../lib/ErrorMessage.svelte";
  import PathBar from "../lib/PathBar.svelte";
  import ProjectBar from "../lib/ProjectBar.svelte";
  import { params } from "../router/Routing";
  import Planner from "../storage/planner";
  import API from "../utils/api";
  import { getErrorMessage } from "../utils/error";
  
  const { projectStore, userStore } = Planner;

  $: username = $params.username.substr(1);

  $: loadProjects(username);

  let error = "";

  let isLoading = false;
  async function loadProjects(username) {
    if (isLoading) {
      return;
    }
    isLoading = true;
    error = "";
    try {
      await API.user(username);
      const user = get(userStore)[username];
      await API.projects(user.user_id);
    } catch (err) {
      error = getErrorMessage(err);
    }
    isLoading = false;
  }

  $: projects = Object.values($projectStore)?.filter(project => project.user_id === $userStore[username]?.user_id);

</script>

<main>
    <PathBar paths={[ { name: username, to: `/@${username}` } ]}/>
    {#if error}
        <ErrorMessage {error}/>
    {/if}
    {#if isLoading}
        <div class="loading">Loading...</div>
    {:else}
      {#if projects && projects.length > 0}
          <div class="projects">
              {#each projects as project}
                  <ProjectBar {project}/>
              {/each}
          </div>
      {:else}
          <div class="empty">No public projects yet</div>
      {/if}
    {/if}
</main>