<script lang="ts">
  import { url, isActiveRoute } from "./Routing";
  export let exact = false;
  export let path;
  export let props = {};
  export let component;
  let isActive = false;
  url.subscribe((href) => {
    isActive = isActiveRoute(href.pathname, path, exact);
  });
</script>

{#if isActive}
  {#if component}
    <svelte:component this={component} {...props} />
  {:else}
    <slot />
  {/if}
{/if}
