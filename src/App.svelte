<script lang="ts">
  import router from "page";
  import Login from "./routes/Login.svelte";
  import { onDestroy, onMount } from "svelte";
  import Auth from "./storage/auth";
  import ProjectList from "./routes/ProjectList.svelte";
  import ProjectView from "./routes/ProjectView.svelte";
  import Route from "./router/Route.svelte";
  import ProfileView from "./routes/ProfileView.svelte";

  onMount(() => {
    Auth.init();
    router.start({
      click: false,
    });
  });

  onDestroy(() => {
    router.stop();
  });

  $: token = Auth.token;
  $: session = Auth.session;
</script>

{#if $token && $session}
  <Route path="/" exact component={ProjectList} />
{:else}
  <Route path="/" exact component={Login} />
{/if}
<Route path="/:username" exact component={ProfileView} />
<Route path="/:username/:project_id" exact component={ProjectView} />
<Route path="/access" exact component={Login} />

<style lang="scss">
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
