<script lang="ts">
  import Box from "../lib/Box.svelte";
import API from "../utils/api";

  let username, password;
</script>

<Box title="Access DAZL" description="...">
  <input type="text" bind:value={username} />
  <input type="password" bind:value={password} />
  <button on:click={() => API.access(username, password)}>Login</button>
</Box>