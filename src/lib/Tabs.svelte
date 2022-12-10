<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let tabs: string[];
  export let active: string=undefined;
  export let onTabClick: (tab: string, index: number) => void;


  onMount(() => {
    if (active === undefined && onTabClick) {
      active = tabs[0];
      onTabClick(tabs[0], 0);
    }
  });

  let hovered: string | undefined = undefined;
  $: currentTab = hovered ?? active;
  $: currentIndex = tabs.indexOf(active);

  let tabsContainer: HTMLElement;

  let columnCount = 0;
  let rowCount = 0;
  
  function computeGrid(i: any) {
    if (tabsContainer) {
      const gridComputedStyle = window.getComputedStyle(tabsContainer);
      columnCount = gridComputedStyle
        .getPropertyValue("grid-template-columns")
        .split(" ").filter(x => x !== "0px").length;
      rowCount = gridComputedStyle
        .getPropertyValue("grid-template-rows")
        .split(" ").filter(x => x !== "0px").length;
    }
  }

  $: computeGrid(tabs);
  $: computeGrid(active);
  $: computeGrid(hovered);
  $: computeGrid(tabsContainer);

  onMount(() => {
    window.addEventListener("resize", computeGrid);
  });

  onDestroy(() => {
    window.removeEventListener("resize", computeGrid);
  });

  // position in tabs by index (in %)
  $: positionX = ((currentIndex % columnCount) / columnCount) * 100;
  $: positionY = (Math.floor(currentIndex / columnCount) / rowCount) * 100;
</script>
<div class="tabs" bind:this={tabsContainer}>
  {#if currentIndex > -1}
    <div
      class="tab-chip"
      style="left: calc({positionX}% + 3px); top: calc({positionY}% + 3px); width: calc({100 /
        columnCount}% - 6px); height: calc({100 / rowCount}% - 6px);"
    />
  {/if}
  {#each tabs as tab, index}
    <div
      class="tab {tab === currentTab ? 'active' : ''}"
      on:click={() => {
        active = tab;
        onTabClick(tab, index);
      }}
      on:mouseover={() => {
        computeGrid(tabs);
        hovered = tab;
      }}
      on:mouseout={() => (hovered = undefined)}
      on:focus={null}
      on:blur={null}
      on:keydown={null}
    >
      {tab}
    </div>
  {/each}
</div>

<style lang="scss">
  .tabs {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));

    padding: 3px;
    border-radius: 5px;
    background-color: #f7f7f7;

    .tab-chip {
      position: absolute;
      z-index: 1;
      border-radius: 5px;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: left 0.2s, top 0.2s;
      height: 25px;
    }
    .tab {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: .85rem;
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 0.5rem;
      border-radius: 5px;
      cursor: pointer;
      color: #a6a6a6;
      transition: color 0.2s;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      &:hover,&.active {
        // darker color
        color: #5e5e5e;
      }
    }
  }
</style>
