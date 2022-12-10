<script lang="ts">
  import { redirectTo } from "../router/Routing";

  type PathDisplay = {
    name?: string;
    icon?: string;
  }

  type PathAction = {
    to?: string;
    action?: () => void;
  }

  type Path = PathDisplay & PathAction;

  export let paths: Path[];
</script>

<div class="paths">
  <button class="btn flat transparent no-3d" on:click={() => redirectTo("/")}>
    /
  </button>
  &nbsp;
  {#each paths as path}
    <button class="btn flat transparent no-3d { !(path.to || path.action) ? "no-button" : ""}" on:click={() => {
      if (path.action) {
        path.action();
      } else if (path.to) {
        redirectTo(path.to);
      }
    }}>
      {#if path.name}
        {path.name}
      {:else}
      <img src={path.icon} alt="" />
      {/if}
    </button>
    &nbsp;
    {#if path !== paths[paths.length - 1]}
        <button class="btn flat transparent no-3d no-button" on:click={() => redirectTo(path.to)}>
        /
        </button>
        &nbsp;
    {/if}
  {/each}
</div>

<style lang="scss">
    .paths {
        display: flex;
        height: 40px;
        // gap: 5a5./rem;
    }
    button {
      height: 100%;
      position: relative;
      img {
        position: absolute;
        width: 1.2rem;
        height: 1.2rem;
        transform: translate(-50%, -50%);
      }
    }
</style>
