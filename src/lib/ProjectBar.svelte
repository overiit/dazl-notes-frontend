<script lang="ts">
  import Auth from "../storage/auth";
  import type { Project } from "../utils/api";
  import { getColor, getHexDarkerColor } from "../utils/colors";
  
  export let project: Project;
  
  let { session } = Auth;

  $: color1 = getColor(project.project_id);
  $: color2 = getColor(project.project_id + project.name);
</script>

<a href={`/@${project.username}/${project.project_id}`} class="card" style="background-image: linear-gradient(160deg, {color1}ec 0%, {color2}ec 100%);">
  <div class="title">{project.name}</div>
</a>

<style lang="scss">
  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    border-radius: 5px;
    color: black;
    text-decoration: none;
    background-color: black;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    &:hover {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    &:active {
      transform: translateY(2px);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
    }
    .title {
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }
  }
</style>
