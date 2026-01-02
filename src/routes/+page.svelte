<script lang="ts">
	import { onMount } from 'svelte';
	import { account, client } from '$lib/appwrite';
	import { Realtime } from 'appwrite';
	import { goto } from '$app/navigation';

	let isLoading = $state(true);
	let user = $state<any>({});

	let unverifiedEmailModal: HTMLDialogElement | null = $state(null);

	onMount(async () => {
		try {
			user = await account.get();
			// console.log(user);
			isLoading = false;
		} catch (error) {
			goto('/login');
			console.error('Error fetching user data:', error);
		}

		let realtime = new Realtime(client);

		realtime.onClose(() => {
			console.log('Realtime connection closed.');
		});

		realtime.onError((error) => {
			console.error('Realtime error:', error);
		});

		realtime.subscribe('account', (response) => {
			if (response.events.includes('users.*.update.verification')) {
        console.log('Received email verification update event:', response);
				// console.log("Email verification status changed:", response);
				user = { ...user, emailVerification: response.payload.emailVerification };
				if (unverifiedEmailModal) {
					if (response.payload.emailVerification) unverifiedEmailModal.close();
					else unverifiedEmailModal.showModal();
				}
			}
		});
	});

	$effect(() => {
		if (unverifiedEmailModal && user && !user.emailVerification) {
			unverifiedEmailModal.showModal();
		}
	});

	// Verify Email

	let verifyButtonDisabled = $state(false);
	let verifyError = $state('');
	let verifyButtonRetryTimeLeft = $state(0);
	let verifyButtonLoading = $state(false);
	let timer: any = null;

	const verifyEmail = async () => {
		verifyError = '';
		verifyButtonDisabled = true;
		verifyButtonLoading = true;
		try {
			await account.createEmailVerification({ url: window.location.origin + '/verify-email' });

			//sleep 1 second to simulate network request
			await new Promise((resolve) => setTimeout(resolve, 1000));

			verifyButtonLoading = false;
			verifyButtonRetryTimeLeft = 180;

			// 清除旧的计时器，防止叠加
			if (timer) clearInterval(timer);

			timer = setInterval(() => {
				if (verifyButtonRetryTimeLeft > 0) {
					verifyButtonRetryTimeLeft -= 1;
				} else {
					verifyButtonDisabled = false;
					clearInterval(timer);
				}
			}, 1000);
		} catch (error: any) {
			verifyButtonLoading = false;
			console.error('Error sending verification email:', error);
			if (error.code === 429) {
				verifyError = 'A verification email has already been sent. Please check your inbox.';
			} else {
				verifyError = error.message || 'An error occurred while sending the verification email.';
			}
			verifyButtonDisabled = false;
		}
	};

	let logoutInProgress = $state(false);

	const handleLogout = async () => {
		logoutInProgress = true;
		// 处理退出登录
		console.log('Logging out...');
		await account.deleteSession({ sessionId: 'current' });

		logoutInProgress = false;
		goto('/login');
	};
</script>

<svelte:head>
	<title>Dashboard | Pdnode Account</title>
	<meta name="description" content="Pdnode Dashboard" />
</svelte:head>

<main class="min-h-screen bg-base-200/50">
	{#if isLoading}
		<div class="flex justify-center items-center h-screen">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<dialog id="showUnverifiedEmail" class="modal" bind:this={unverifiedEmailModal}>
			<div class="modal-box flex flex-col items-center">
				<h3 class="text-lg font-bold text-center">Unverified Email</h3>
				<p class="py-4 text-center">You need to verify your email address.</p>
				{#if verifyError}
					<div
						role="alert"
						class="alert alert-error alert-soft mb-4 w-full flex justify-center items-center"
					>
						<span class="text-center">{verifyError}</span>
					</div>
				{/if}
				<button class="btn" onclick={() => verifyEmail()} disabled={verifyButtonDisabled}>
					{#if verifyButtonLoading}
						<span class="loading loading-dots loading-md"></span>
					{:else if verifyButtonRetryTimeLeft > 0}
						Resend in {verifyButtonRetryTimeLeft}s
					{:else}
						Send Verification Email
					{/if}
				</button>
			</div>
		</dialog>

		<div class="container mx-auto px-4 pt-16 pb-12 relative z-10 max-w-5xl">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
				<div class="lg:col-span-4">
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body items-center text-center">
							<h1 class="text-2xl font-bold">{user.name}</h1>
							<div class="mb-4"></div>
							<p class="text-base-content/60 text-sm mb-4">Email: {user.email}</p>

							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="badge {user.emailVerification
										? 'badge-success'
										: 'badge-warning badge-dash'}"
									>{user.emailVerification ? 'Verified' : 'Unverified'}</span
								>
								<span class="badge badge-ghost"
									>Joined on {new Date(user.$createdAt).toLocaleDateString()}</span
								>
							</div>

							<div class="divider"></div>

							<button
								class="btn btn-error btn-outline btn-block"
								onclick={handleLogout}
								disabled={logoutInProgress}
							>
								{#if logoutInProgress}
									<span class="loading loading-dots loading-md"></span>
								{:else}
									Logout
								{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="lg:col-span-8 space-y-6">
					<div class="card bg-base-100 shadow-xl border border-base-300">
						<div class="card-body">
							<h2 class="card-title text-xl mb-6">Account Info</h2>

							<div class="space-y-4">
								<div
									class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-base-200/50 rounded-xl gap-4 transition hover:bg-base-200"
								>
									<div>
										<p class="text-xs uppercase tracking-wider font-bold opacity-50">
											Email Address
										</p>
										<p class="font-medium text-lg text-base-content">{user.email}</p>
									</div>
									<button class="btn btn-primary btn-sm px-6">Edit</button>
								</div>

								<div
									class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-base-200/50 rounded-xl gap-4"
								>
									<div>
										<p class="text-xs uppercase tracking-wider font-bold opacity-50">Security</p>
										<p class="font-medium text-lg text-base-content">Password</p>
									</div>
									<button class="btn btn-ghost btn-sm border-base-300">Update Password</button>
								</div>
							</div>

							<div class="divider mt-8"></div>

							<div class="card-actions">
								<button class="btn btn-outline btn-block"> Account Settings </button>
							</div>
						</div>
					</div>

					<div class="alert bg-base-100 shadow-sm border-base-300">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-info shrink-0 w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path></svg
						>
						<div class="text-sm">
							<h3 class="font-bold">Need help?</h3>
							<div class="text-xs opacity-60">Contact support for any account related issues.</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>
