<script lang="ts">
  import type { Task } from "../utils/api";
  import API from "../utils/api";
  import { statusToBtn, statusToIcon } from "../utils/status";
  import { timeAgo } from "../utils/time";
  import BarStatusSelector from "./BarStatusSelector.svelte";

  export let task: Task;
  export let viewTask: (task: Task) => void;

  let selectStatus = false;
  async function onStatusChange(status: string) {
    selectStatus = false;
    await API.updateTask(task.task_id, { status });
  }
</script>

<div class="bar">
  <div class="details">
    <div class="name">
      {task.name}
    </div>
    <small>Last edited: <b>{timeAgo(task.updated_at)}</b></small>
    {#if task.description}
    <!-- TODO: WHERE to PUT THE DESCRIPTION? -->
      <!-- <div class="description">{task.description}</div> -->
    {/if}
  </div>
  <div class="actions">
    <button
      class="btn no-3d flat icon {statusToBtn(task.status)}"
      on:click={() => (selectStatus = true)}
    >
      {task.status}
    </button>
    <button
      class="btn no-3d gray flat"
      id="view"
      on:click={() => viewTask(task)}>VIEW</button
    >
  </div>
  {#if selectStatus}
    <BarStatusSelector onChange={onStatusChange} {task} />
  {/if}
</div>

<style lang="scss">
  .bar {
    display: flex;
    position: relative;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: white;
    border: 2px solid #efefef;
    border-radius: 5px;
    margin-bottom: 1rem;
    line-height: 1rem;

    .details {
      display: flex;
      flex-flow: column;
      .name {
        font-size: 1rem;
        font-weight: 700;
        margin-top: .3rem;
      }
      .description {
        font-size: 0.9rem;
        color: #898989;
      }
      small {
        font-size: 0.5rem;
        color: rgb(168, 168, 168);
      }
    }
    .actions {
      display: flex;
      margin-left: auto;
      button#view {
        margin-left: 1rem;
        // width: 150px;
      }
      button#delete {
        margin-left: 1rem;
      }
    }
  }
</style>
