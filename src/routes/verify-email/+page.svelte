<script lang="ts">
  import { onMount } from 'svelte';
  import { account } from '$lib/appwrite';


  let errorMessage = $state("")
  let successMessage = $state("")

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId')
    const secret = params.get('secret')
    
    if (!userId || !secret) {
      console.error('Missing userId or secret in URL parameters.');
      errorMessage = "Invalid verification link.";
      return;
    }

    const result = account.updateEmailVerification({userId: userId!, secret: secret!});

  })
</script>

<svelte:head>
	<title>Verify Email | Pdnode Account</title>
	<meta name="description" content="Pdnode Account Register Page" />
</svelte:head>

<div class="flex justify-center items-center w-full h-screen bg-gray-200">
    <div class="bg-white max-w-md p-12 md:p-16 rounded-2xl shadow-xl w-full">

        {#if errorMessage}
        <div role="alert" class="alert alert-outline alert-error">
          <span>{errorMessage}</span>
        </div>
        {:else}
        <div role="alert" class="alert alert-outline alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Verifying your email, please wait...</span>
        </div>
        {/if}
    </div>
</div>
