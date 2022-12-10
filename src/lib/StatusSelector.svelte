<script lang="ts">
  import { statusList, statusToBtn } from "../utils/status";

  export let onChange: (status: string) => void;

</script>

<div class="selector">
    <h3>NEW STATUS</h3>
    <div class="buttons">
        {#each statusList.slice().reverse() as status}
            <button class="btn flat {statusToBtn(status)}" on:click={() => onChange(status)}>{status}</button>
        {/each}
    </div>
</div>

<style lang="scss">
  .selector {
    display: flex;
    flex-flow: column;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.65);
    h3 {
        margin-top: 1rem;
        text-align: center;
        font-size: 2rem;
        color: white;
        height: 2rem;
        text-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
    }
    .buttons {
        height: calc(100% - 6rem);
        padding: 1rem;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        grid-gap: .5rem;
        button {
            overflow: hidden;
            font-size: .9rem;
            height: 2rem;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
  }
</style>
