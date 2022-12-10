<script lang="ts">
    export let onClick: () => void;
    export let centered: "NONE" | "LEFT" | "TOP" | "BOTH" = "BOTH";
    export let style: string = "";

    let centerStyle = "";
    if (centered === "TOP" || centered === "BOTH") {
        centerStyle += "justify-content: center;";
    }
    if (centered === "LEFT" || centered === "BOTH") {
        centerStyle += "align-items: center;";
    }
</script>
<div class="overlay" style="{centerStyle}">
    <div class="background" on:click={onClick} on:keypress={onClick} name="close"></div>
    <div class="content" {style}>
        <slot></slot>
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
        z-index: 2;
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
        .content {
            position: relative;
            z-index: 4;
            max-height: calc(100% - 50px);
            max-width: calc(100% - 50px);
        }
    }
</style>