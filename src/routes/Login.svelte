<script lang="ts">
  import Box from "../lib/Box.svelte";
  import CenteredPage from "../lib/CenteredPage.svelte";
  import ErrorMessage from "../lib/ErrorMessage.svelte";
  import Loader from "../lib/Loader.svelte";
  import Auth from "../storage/auth";
  import API, { ErrorResponse } from "../utils/api";
  import { getErrorMessage } from "../utils/error";

  let username: string = "",
    password: string = "",
    terms: boolean,
    error: string | undefined,
    loading: boolean = false;
  const { token, loginError } = Auth;

  const signup = async () => {
    loading = true;
    error = "";
    loginError.set(null);
    if (!/^[a-zA-Z0-9_-]{3,16}$/.test(username)) {
      loading = false;
      error = "Username must be 3-16 characters long and contain only letters, numbers, _ and -.";
      return;
    }
    if (!password || password.length < 8) {
      loading = false;
      error = "Password must be at least 8 characters long.";
      return;
    }
    if (!terms) {
      loading = false;
      error = "You must accept the terms and conditions";
      return;
    }
    try {
      const result = await API.signup(username, password);
      if (result instanceof ErrorResponse) {
        error = result.message;
      }
    } catch (err) {
        error = getErrorMessage(err);
    }
    loading = false;
  };

  const signin = async () => {
    loading = true;
    error = "";
    loginError.set(null);
    try {
      const result = await API.signin(username, password);
      if (result instanceof ErrorResponse) {
        error = result.message;
      }
    } catch (err) {
        error = getErrorMessage(err);
    }
    loading = false;
  };
</script>

<CenteredPage>
  <Box
    title="Access DAZL"
    description="Something about this task, what its for. The smallest detail may help looking at this and reviewing it quickly..."
  >
    <label for="username" class="form-label"> Username </label>

    <input
      class="input no-3d"
      type="text"
      id="username"
      placeholder="john_smith_2"
      bind:value={username}
    />
    <label for="password" class="form-label"> Password </label>
    <input
      class="input no-3d"
      type="password"
      id="password"
      placeholder="not1234"
      bind:value={password}
    />
    <div class="terms">
      <input type="checkbox" id="terms" bind:checked={terms} />
      <label for="terms"> I agree to the terms and conditions </label>
    </div>
    {#if !loading && !$token}
      <div class="actions">
        <button type="submit" class="btn primary no-3d" on:click={signin}>
          ACCESS
        </button>
        <button type="submit" class="btn secondary no-3d" on:click={signup}>
          CREATE ACCOUNT
        </button>
      </div>
    {:else}
      <center>
        <Loader />
      </center>
    {/if}
    <ErrorMessage error={error ?? $loginError?.message} />
  </Box>
</CenteredPage>

<style lang="scss">
  .terms {
    label {
      font-weight: 400;
      color: #898989;
    }
  }

  input.input {
    width: calc(100% - 2rem);
  }

  input {
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    button {
      width: 48%;
    }
  }
</style>
