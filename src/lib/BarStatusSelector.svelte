<script lang="ts">
  import type { Task } from "../utils/api";
  import { statusList, statusToBtn } from "../utils/status";

  export let task: Task | undefined;
  export let onChange: (status: string) => void;
</script>

<div class="selector">
  <h3>{ task?.name ?? "NEW STATUS" }</h3>
  <div class="buttons">
    {#each statusList as status}
      <button
        class="btn flat smol {statusToBtn(status)}"
        on:click={() => onChange(status)}>{status}</button
      >
    {/each}
  </div>
</div>

<style lang="scss">
  .selector {
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: calc(100% - 2rem);
    border-radius: 5px;
    padding: 0 1rem;
    background-color: rgba(0, 0, 0, 0.75);
    h3 {
      margin-top: 1rem;
      text-align: center;
      font-size: 2rem;
      color: white;
      height: 2rem;
      text-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
    }
    .buttons {
      display: flex;
      gap: .5rem;
      margin-left: auto;
      display: flex;
    }
  }
</style>
