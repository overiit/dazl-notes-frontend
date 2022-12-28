<script lang="ts">
  import { get } from "svelte/store";
  import ErrorMessage from "../lib/ErrorMessage.svelte";
  import PathBar from "../lib/PathBar.svelte";
  import ProjectBar from "../lib/ProjectBar.svelte";
  import Tabs from "../lib/Tabs.svelte";
  import { params } from "../router/Routing";
  import Planner from "../storage/planner";
  import API from "../utils/api";
  import { getErrorMessage } from "../utils/error";
  
  const { projectStore, userStore } = Planner;

  const PROJECTS_PER_PAGE = 5;

  $: username = $params.username;

  $: loadProjects(username);

  $: projects = Object.values($projectStore)?.filter(project => project.user_id === $userStore[username]?.user_id);

  let error = "";

  let isLoading = false;
  async function loadProjects(username) {
    if (isLoading) {
      return;
    }
    if (!projects || !projects.length) {
      isLoading = true;
    }
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

  let projectPage = 0;

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
              {#each projects.slice(projectPage * PROJECTS_PER_PAGE, (projectPage * PROJECTS_PER_PAGE) + PROJECTS_PER_PAGE) as project}
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
          <div class="empty">No public projects yet</div>
      {/if}
    {/if}
</main>