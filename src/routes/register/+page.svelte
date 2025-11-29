<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import Icon from "@iconify/svelte";
    import { tick } from 'svelte';

    let email = $state("")
    let verificationCode = $state("")
    let nextStepButtonDisabled = $state(false)
    let emailInput: HTMLInputElement;
    let type: null | string = $state("verifyEmail")
    let form: HTMLFormElement;

    afterNavigate(async () => {
        const queryString = window.location.search;
        const params = new URLSearchParams(queryString);
        console.log(params.get("type"))

        if (params.get("type") !== null && params.get("type") !== "verifyEmail" && params.get("type") !== "completeRegister"){
            params.set("type", "verifyEmail")
            const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
            await tick()
            goto(newUrl);
            return
        }
        type = params.get("type")
    })

    $effect(() => {
        if (!email || !verificationCode){
            nextStepButtonDisabled = true
        }else {
            nextStepButtonDisabled = false
        }
    })

    const sendCode = () => {
        if (!emailInput.checkValidity()){
            form.reportValidity()
            return
        }

        fetch("http://localhost:3333/email/send", {method: "POST"})
    }

</script>

<svelte:head>
	<title>Register | Pdnode Account</title>
	<meta name="description" content="Pdnode Account Register Page" />
</svelte:head>

<div class="flex justify-center items-center w-full h-screen bg-gray-200">
    <div class="bg-white max-w-md p-8 md:p-12 rounded-2xl shadow-xl w-full">
        <h3 class="text-3xl font-bold mb-6 text-center">Register</h3>
        
        <form class="flex flex-col gap-4" bind:this={form}>
            <div class="flex flex-col">
                <label for="email" class="font-medium text-gray-700">Email</label>
                <div class="flex flex-row justify-center items-center gap-1">
                    <label class="input validator join-item">
                        <Icon icon="mdi:email-outline" class="mr-1" />
                        <input bind:this={emailInput} bind:value={email} type="email" placeholder="user@example.com" required />
                    </label>
                    <button class="btn max-w-md join-item" onclick={sendCode} type="button">Send Code</button>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <label for="verification-code" class="font-medium text-gray-700">Email Verification Code</label>           
                <label class="input w-full">
                    <Icon icon="mdi:security" />
                    <input 
                        id="verification-code" 
                        type="number" 
                        placeholder="123456"
                        required 
                        min="100000"
                        max="999999"
                        bind:value={verificationCode}

                    >
                </label>
            </div>

            <!-- <div class="flex flex-col gap-1">
                <label for="password" class="font-medium text-gray-700">Password</label>
                <input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    required 
                    minlength="8"
                    class="input"
                >
            </div> -->

            <button 
                type="submit" 
                class="btn btn-primary btn-soft"
                disabled={nextStepButtonDisabled}
            >
                Next Step
            </button>
        </form>
    </div>
</div>