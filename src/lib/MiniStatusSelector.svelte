<script lang="ts">
  import { statusList, statusToBtn, statusToIcon } from "../utils/status";

  export let currentStatus: string;
  export let onChange: (status: string) => void;
  export let icon: boolean = false;

</script>

<div class="buttons">
  {#each [...statusList, currentStatus] as status}
    <button class="btn flat {statusToBtn(status)}" on:click={() => onChange(status)}>
      {#if icon}
        <div class="icon">
          {@html statusToIcon(status)}
        </div>
      {:else}
        {status}
      {/if}
    </button>
  {/each}
</div>

<style lang="scss">
  .buttons {
    display: flex;
    gap: .5rem;
  }
</style>


