<script lang="ts">
  import type { Task } from "../utils/api";
  import API from "../utils/api";
  import { statusToBtn } from "../utils/status";
  import { timeAgo } from "../utils/time";
  import StatusSelector from "./StatusSelector.svelte";

  export let task: Task;
  export let viewTask: (task: Task) => void;

  let editingTitle = false;

  let selectStatus = false;
  async function onStatusChange(status: string) {
    selectStatus = false;
    await API.updateTask(task.task_id, { status });
  }
</script>

<div class="card">
  {#if editingTitle}
    <input
      class="title inline"
      type="text"
      autofocus
      bind:value={task.name}
      on:blur={() => {
        editingTitle = false;
        API.updateTask(task.task_id, { name: task.name });
      }}
      on:keydown={(e) => {
        if (e.key === "Enter") {
          editingTitle = false;
          API.updateTask(task.task_id, { name: task.name});
        }
      }}
    />
  {:else}
    <div class="title" on:dblclick={() => (editingTitle = true)}>
      {task.name}
    </div>
  {/if}
  <div class="description">
    <pre>{task.description}</pre>
  </div>
  <div class="date">
    Last edited: <b title={new Date(task.updated_at).toLocaleString()}
      >{timeAgo(task.updated_at)}</b
    >
  </div>
  <div class="actions">
    <button
      class="btn flat {statusToBtn(task.status)} no-3d smol"
      on:click={() => (selectStatus = true)}>{task.status}</button
    >
    <button
      class="btn transparent flat no-3d smol"
      on:click={() => viewTask(task)}>VIEW</button
    >
  </div>
  {#if selectStatus}
    <StatusSelector onChange={onStatusChange} />
  {/if}
</div>

<style lang="scss">
  .card {
    position: relative;
    display: flex;
    flex-flow: column;
    padding: 1rem;
    border-radius: 5px;
    min-height: calc(150px - 2rem);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
    background-color: white;
    .title {
      font-size: 1.3rem;
      font-weight: 700;
      padding: 0.2rem;
      margin: -0.2rem;
      border-radius: 5px;
      &:not(input) {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
    }
    .description {
      font-size: 0.7rem;
      color: #898989;
      margin-bottom: 0.5rem;
      pre {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 3;
        -webkit-line-clamp: 3;
        box-orient: vertical;
        -webkit-box-orient: vertical;
        -moz-box-orient: vertical;
        max-height: 40px;
        margin-top: .5rem;
      }
    }
    .date {
      margin-top: auto;
      font-size: 0.5rem;
      margin-bottom: 0.1rem;
      color: #acacac;
    }
    .actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      button {
        width: 100%;
      }
    }
  }
</style>
