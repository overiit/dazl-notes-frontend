<script lang="ts">
  import API from "./utils/api";
  import Login from "./routes/Login.svelte";
  import { onMount } from "svelte";
  import Auth from "./storage/auth";

  onMount(() => {
    Auth.init();
  });

  $: token = Auth.token;
  $: user = Auth.user;

</script>

{#if $token && $user}
  <h1>Logged in</h1>
  <p>{JSON.stringify($user)}</p>
  <button on:click={() => API.logout()}>Logout</button>
{:else if $token}
  <h1>Loading session.</h1>
{:else}
  <Login />
{/if}
