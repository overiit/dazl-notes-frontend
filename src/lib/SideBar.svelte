<script lang="ts">
import { fade } from 'svelte/transition';
  export let title;
  export let description = "";
  export let scale = 1;
  export let onClose: () => void;
</script>

<div class="overlay">
  <div class="background" transition:fade on:click={onClose} on:keypress={onClose} id="close" />
  <div class="side-bar" transition:fade style="width: {450 * scale}px;">
    <h2 class="title">{title}</h2>
    <p class="description">{description}</p>
    <hr />
    <div class="inner">
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    z-index: 3;
    display: flex;
    flex-flow: column;
    .background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
      background: rgba(0, 0, 0, 0.5);
    }
  }
  .side-bar {
    background-color: #ffffff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    padding: 25px;
    max-width: calc(100% - 50px);
    height: calc(100% - 50px);
    position: relative;
    z-index: 4;
    position: absolute;
    right: 0;
    top: 0;
    h2 {
      color: black;
      font-weight: 700;
      font-size: 1.3rem;
    }
    p {
      font-size: 1rem;
      font-weight: 400;
      color: #898989;
      margin-bottom: 0.5rem;
    }
    .inner {
      height: calc(100% - 75px);
      overflow: hidden;
      overflow-y: auto;
      .content {
        display: flex;
        flex-flow: column;
        height: 100%;
      }
    }
  }
</style>
