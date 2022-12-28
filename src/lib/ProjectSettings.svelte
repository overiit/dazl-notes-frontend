<script lang="ts">
  import Planner from "../storage/planner";
  import { AuthorPermission, type Project } from "../utils/api";
  import API from "../utils/api";
  import ErrorMessage from "./ErrorMessage.svelte";
  import Tabs from "./Tabs.svelte";
  import Auth from "../storage/auth";
  import SideBar from "./SideBar.svelte";

  export let project: Project;
  export let onClose: () => void;
  let error;

  const { authorStore } = Planner;
  const { session } = Auth;

  let currentTab;

  $: authors = $authorStore[project.project_id];

  enum ProjectTabs {
    SETTINGS = "Settings",
    MEMBERS = "Authors",
  }

  async function updateProject(changes: { public?: boolean }) {
    error = "";
    try {
      await API.updateProject(project.project_id, changes);
    } catch (err) {
      error = err.message;
    }
  }

  let newAuthor = "";

  async function addAuthor () {
    error = "";
    try {
      const response = await API.addAuthor(project.project_id, newAuthor, AuthorPermission.EDITOR);
      if (response.success == false) {
        error = response.message; 
      }
      newAuthor = "";
    } catch (err) {
      error = err.message;
    }
  }

  async function removeAuthor (username: string) {
    error = "";
    try {
      const response = await API.removeAuthor(project.project_id, username);
      if (response.success == false) {
        error = response.message; 
      }
    } catch (err) {
      error = err.message;
    }
  }

</script>

<SideBar {onClose} title="Project Settings">
  <Tabs
    tabs={Object.values(ProjectTabs)}
    onTabClick={(tab) => {
      currentTab = tab;
      error = "";
    }}
  />
  {#if currentTab === ProjectTabs.SETTINGS}
    <div class="settings">
      <label for="public" class="form-label"
        >Visibility</label
      ><br>
      {#if project.public}
        <button
          class="btn no-3d btn-complete flat"
          on:click={() => updateProject({ public: false })}>PUBLIC</button
        >
      {:else}
        <button
          class="btn no-3d btn-blocked flat"
          on:click={() => updateProject({ public: true })}>PRIVATE</button
        >
      {/if}
      <div>
        <ErrorMessage {error} />
      </div>
    </div>
  {:else if currentTab === ProjectTabs.MEMBERS}
    <div class="members">
      {#each authors as author}
        <!-- author.username with chip to delete -->
        <div class="author">
          <label for="username" class="form-label">{ author.username }</label><br>
          {#if author.user_id !== project.user_id}
            {#if project.user_id === $session.user_id}
              <button class="btn no-3d btn-blocked flat" on:click={() => removeAuthor(author.username)}>Remove</button>
            {:else}
              <button class="btn no-3d primary flat smol" disabled>Not permitted</button>
            {/if}
          {:else}
            <button class="btn no-3d primary flat smol" disabled>Owner</button>
          {/if}
        </div>
      {/each}
    </div>
    <div class="add-author">
      <label for="username" class="form-label">Username</label><br>
      <input type="text" name="username" class="input no-3d full flat" placeholder="Username" bind:value={newAuthor}/>
      <button class="btn flat btn-complete no-3d" on:click={addAuthor}>Add Author</button>
      <ErrorMessage {error} />
    </div>
  {/if}
  </SideBar>

<style lang="scss">
  .add-author {
    margin-top: auto;
    display: flex;
    flex-flow: column;
    padding-bottom: 3px;
    input {
      margin-bottom: .5rem;
    }
  }
</style>
