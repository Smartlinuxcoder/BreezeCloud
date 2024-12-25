<script>
    import "../app.css";
    import favicon from "../favicon.png";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    $: pageName = $page.data.pageName;
    $: user = $page.data.user;
    onMount(() => {
        console.log(user);
    });
</script>

<svelte:head>
    <title>{pageName}</title>
</svelte:head>

<main
    class="min-h-screen flex flex-col bg-gradient-to-b from-[#180161] to-[#4F1787]"
>
    <header class="bg-[#4F1787] shadow-lg">
        <div class="container mx-auto px-4 py-3">
            <div class="flex flex-col sm:flex-row items-center justify-between">
                <div class="flex items-center mb-4 sm:mb-0">
                    {#if pageName === "Cogestione"}
                        <img src={favicon} alt="Logo" class="w-12 h-12 mr-4" />
                    {:else}
                        <a
                            href="/"
                            class="text-4xl text-gray-100 mr-4 hover:text-[#FB773C] transition-colors duration-200"
                            aria-label="Home"
                        >
                            🏠
                        </a>
                    {/if}
                    <h1 class="text-3xl font-bold text-[#EB3678]">
                        {pageName}
                    </h1>
                </div>
                {#if !user}
                <nav class="flex space-x-4">
                    <a
                        href="/login"
                        class="text-gray-100 hover:text-[#FB773C] transition-colors duration-200 text-lg"
                        >Sign In</a
                    >
                    <a
                        href="/register"
                        class="text-gray-100 hover:text-[#FB773C] transition-colors duration-200 text-lg"
                        >Register</a
                    >
                    <a
                        href="/dash"
                        class="text-gray-100 hover:text-[#FB773C] transition-colors duration-200 text-lg"
                        >dash</a
                    >
                </nav>
                {:else}
                <nav class="flex space-x-4">
                    <a
                        href="/dash"
                        class="text-gray-100 hover:text-[#FB773C] transition-colors duration-200 text-lg"
                        >dash</a
                    >
                    <a
                        href="/logout"
                        class="text-gray-100 hover:text-[#FB773C] transition-colors duration-200 text-lg"
                        >Log Out</a
                    >
                </nav>
                
                {/if}
            </div>
        </div>
    </header>

    <div class="flex-grow container mx-auto px-4 py-8">
        <slot></slot>
    </div>

    <footer class="bg-[#4F1787] text-gray-100 py-4 mt-auto">
        <div class="container mx-auto px-4 text-center text-sm">
            Copyright &copy; 2024
            <a
                href="https://smartlinux.xyz"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[#FB773C] hover:underline hover:text-[#EB3678] transition duration-200"
            >
                Smartlinux.xyz
            </a>. All rights deserved.
        </div>
    </footer>
</main>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap");

    :global(body) {
        font-family: "Ubuntu", sans-serif;
        color: white;
        margin: 0;
    }
</style>
