<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { account, AppwriteErrorTypeMessages } from '$lib/appwrite';

	let email = $state('');
	let password = $state('');
	let errorMessage: null | string = $state(null);
	let submitDisabled = $state(false);

	onMount(() => {
		account
			.get()
			.then(() => {
				goto('/');
			})
			.catch(() => {
				// User not logged in, stay on the login page
			});
	});

	const handleSubmit = async (event: Event) => {
    errorMessage = null;
		event.preventDefault();
		submitDisabled = true;
		try {
			await account.createEmailPasswordSession({
				email,
				password
			});

			goto('/');
		} catch (error: any) {
			console.error('Login error:', error);
			const errorType = error.type as keyof typeof AppwriteErrorTypeMessages;
			errorMessage =
				AppwriteErrorTypeMessages[errorType] || 'An unexpected error occurred during login.';
			submitDisabled = false;
		}
	};
</script>

<svelte:head>
	<title>Login | Pdnode Account</title>
	<meta name="description" content="Pdnode Account Login Page" />
</svelte:head>

<div class="flex justify-center items-center w-full h-screen bg-gray-200">
	<div class="bg-white max-w-md p-8 md:p-12 rounded-2xl shadow-xl w-full">
		<h3 class="text-3xl font-bold mb-6 text-center">Login</h3>

		<form
			class="flex flex-col gap-4 justify-center items-center"
			onsubmit={(event) => handleSubmit(event)}
		>
			<label class="input validator">
				<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<g
						stroke-linejoin="round"
						stroke-linecap="round"
						stroke-width="2.5"
						fill="none"
						stroke="currentColor"
					>
						<rect width="20" height="16" x="2" y="4" rx="2"></rect>
						<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
					</g>
				</svg>
				<input type="email" bind:value={email} placeholder="mail@site.com" required />
			</label>
			<label class="input validator">
				<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<g
						stroke-linejoin="round"
						stroke-linecap="round"
						stroke-width="2.5"
						fill="none"
						stroke="currentColor"
					>
						<path
							d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
						></path>
						<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
					</g>
				</svg>
				<input
					type="password"
					bind:value={password}
					required
					placeholder="Password"
					minlength="8"
					title="Must be more than 8 characters"
				/>
			</label>

      <a class="link text-xs" href="/register">Don't have an account? Register here.</a>


      {#if errorMessage}
      <div role="alert" class="alert alert-error alert-soft">
        <span>{errorMessage}</span>
      </div>
      {/if}

			<button class="btn" type="submit" disabled={submitDisabled}>
				{#if submitDisabled}
					<span class="loading loading-dots loading-md"></span>
				{:else}
					Login
				{/if}
			</button>
		</form>
	</div>
</div>
