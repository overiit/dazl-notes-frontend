<script lang="ts">
  export let title;
  export let description = "";
  export let scale = 1;
</script>

<div class="box" style="width: {600 * scale}px;">
  <h2 class="title">{title}</h2>
  <p class="description">{description}</p>
  <hr />
  <div class="inner">
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  .box {
    background-color: #ffffff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
    border-radius: 25px;
    padding: 25px;
    max-width: calc(100% - 50px);
    max-height: calc(100% - 50px);
    // height: 500px;
    h2 {
      color: black;
      font-weight: 700;
      font-size: 2rem;
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
