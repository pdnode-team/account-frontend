<script lang="ts">
	import { onMount } from 'svelte';
	import { account, client } from '$lib/appwrite';
	import { Realtime } from 'appwrite';
	import { goto } from '$app/navigation';

	let isInit = $state(true);
	let user = $state<any>({});
  

	let unverifiedEmailModal: HTMLDialogElement | null = $state(null);

	onMount(async () => {
		try {
			user = await account.get();
			// console.log(user);
			isInit = false;
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

  // Update Email
  let updateEmailModal: HTMLDialogElement | null = $state(null);
  let updateEmailError = $state('');
  let updateEmailEmail = $state('');
  let updateEmailPassword = $state('');
  let updateEmailInProgress = $state(false);

  const updateEmail = async () => {
    updateEmailInProgress = true;
    updateEmailError = '';
    if (!updateEmailEmail || !updateEmailPassword) {
      updateEmailError = 'Please provide both email and password.';
      updateEmailModal?.showModal();
      updateEmailInProgress = false;
      return;
    }else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateEmailEmail)) {
      updateEmailError = 'Please provide a valid email address.';
      updateEmailModal?.showModal();
      updateEmailInProgress = false;
      return;
    }

    try {
      await account.updateEmail({
        email: updateEmailEmail,
        password: updateEmailPassword
      });
			user = await account.get();
    }catch(error: any) {
      console.error('Error updating email:', error);
      updateEmailModal?.showModal();
      updateEmailError = error.message || 'An error occurred while updating the email.';
    }
    updateEmailInProgress = false;
  };



</script>

<svelte:head>
	<title>Dashboard | Pdnode Account</title>
	<meta name="description" content="Pdnode Dashboard" />
</svelte:head>

{#if updateEmailInProgress}
<div class="toast toast-top toast-center">
  <div class="alert alert-info alert-soft">
    <span>We are updating your email address, which may take some time. Please do not close the webpage in the meantime.</span>
  </div>
</div>
{/if}

<main class="min-h-screen bg-base-200/50">
	{#if isInit}
		<div class="flex justify-center items-center h-screen">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
    <!-- Modal - Show Unverified Email -->
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

        <div class="flex flex-row gap-4">        
          <button class="btn" onclick={() => verifyEmail()} disabled={verifyButtonDisabled}>
            {#if verifyButtonLoading}
              <span class="loading loading-dots loading-md"></span>
            {:else if verifyButtonRetryTimeLeft > 0}
              Resend in {verifyButtonRetryTimeLeft}s
            {:else}
              Send Verification Email
            {/if}
          </button>
          <button class="btn" onclick={() => updateEmailModal?.showModal()}>Change My Email</button>
        </div>
			</div>
		</dialog>

        <!-- Modal - Show Update Email Form -->
    <dialog class="modal" bind:this={updateEmailModal}>
      <div class="modal-box flex flex-col items-center justify-center gap-6"> <h3 class="text-lg font-bold">Update Email</h3>

        <div class="flex flex-col gap-1.5 w-full max-w-xs"> 
          <label class="text-xs font-medium opacity-70 ml-1" for="new-email">
            Your new email
          </label>
          
          <label class="input validator w-full">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input id="new-email" type="email" bind:value={updateEmailEmail} placeholder="mail@site.com" required />
          </label>
        </div>

        <div class="flex flex-col gap-1.5 w-full max-w-xs">
          <label class="text-xs font-medium opacity-70 ml-1" for="password">
            Confirm Password
          </label>
          <label class="input validator w-full">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input id="password" bind:value={updateEmailPassword} type="password" required placeholder="Password" minlength="8" />
          </label>
        </div>

        {#if updateEmailError}
          <div role="alert" class="alert alert-error alert-soft w-full flex justify-center items-center">
            <span class="text-center">{updateEmailError}</span>
          </div>
        {/if}

        <form method="dialog" class="modal-action w-full flex justify-center">
          <button class="btn btn-primary" onclick={() => updateEmail()}>Update</button>
          <button class="btn">Cancel</button>
        </form>
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
									<button class="btn btn-primary btn-sm px-6" onclick={() => updateEmailModal?.showModal()}>Edit</button>
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
