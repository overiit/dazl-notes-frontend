<script lang="ts">
  import Box from "../lib/Box.svelte";
  import CenteredPage from "../lib/CenteredPage.svelte";
  import ProjectBar from "../lib/ProjectBar.svelte";
  import Tabs from "../lib/Tabs.svelte";
  import { redirectTo } from "../router/Routing";
  import Auth from "../storage/auth";
  import Planner from "../storage/planner";

  const { projectStore } = Planner;
  const { session } = Auth;

  const PROJECTS_PER_PAGE = 10;

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
    <button class="btn primary no-3d" on:click={() => redirectTo("/create")}>
      Create New Project
    </button>
  </Box>
</CenteredPage>


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
</style>
