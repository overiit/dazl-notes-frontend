<script lang="ts">
    export let scale=1;
</script>

<span class="loader" style="width: {scale}rem;height: {scale}rem;border-width: {scale}px;"/>

<style lang="scss">
  .loader {
    display: inline-block;
    border: 2px solid transparent;
    border-radius: 50%;
    border-top-color: rgb(62, 62, 62);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
