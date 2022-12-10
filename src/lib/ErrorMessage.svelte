<script lang="ts">
  export let error;
</script>

{#if error}
  <small class="error">
    {error}
  </small>
{/if}

<style lang="scss">
    .error {
      color: #ff0000;
      font-weight: 700;
    }
</style>
