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

<main class="min-h-screen flex flex-col bg-gradient-to-br from-[#1e1e2e] to-[#302d41]">
    <header class="backdrop-blur-lg bg-[#1e1e2e]/70 border-b border-[#6e6c7e]/20 shadow-lg">
        <div class="container mx-auto px-4 py-3">
            <div class="flex flex-col sm:flex-row items-center justify-between">
                <div class="flex items-center mb-4 sm:mb-0">
                    {#if pageName === "BreezeCloud"}
                        <img src={favicon} alt="Logo" class="w-12 h-12 mr-4" />
                    {:else}
                        <a
                            href="/"
                            class="text-4xl text-[#cdd6f4] mr-4 hover:text-[#89b4fa] transition-colors duration-200"
                            aria-label="Home"
                        >
                            🏠
                        </a>
                    {/if}
                    <h1 class="text-3xl font-bold text-[#cdd6f4]">
                        {pageName}
                    </h1>
                </div>
                {#if !user}
                <nav class="flex space-x-4">
                    <a
                        href="/login"
                        class="text-[#a6adc8] hover:text-[#89b4fa] transition-colors duration-200 text-lg"
                        >Sign In</a
                    >
                    <a
                        href="/register"
                        class="text-[#a6adc8] hover:text-[#89b4fa] transition-colors duration-200 text-lg"
                        >Register</a
                    >
                    <a
                        href="/dashboard"
                        class="text-[#a6adc8] hover:text-[#89b4fa] transition-colors duration-200 text-lg"
                        >Dash</a
                    >
                </nav>
                {:else}
                <nav class="flex space-x-4">
                    <a
                        href="/dashboard"
                        class="text-[#a6adc8] hover:text-[#89b4fa] transition-colors duration-200 text-lg"
                        >Dash</a
                    >
                    <a
                        href="/logout"
                        class="text-[#a6adc8] hover:text-[#89b4fa] transition-colors duration-200 text-lg"
                        >Log Out</a
                    >
                </nav>
                {/if}
            </div>
        </div>
    </header>

    <div class="flex-grow container mx-auto px-4 py-8">
        <div class="backdrop-blur-lg bg-[#1e1e2e]/70 border border-[#6e6c7e]/20 rounded-xl shadow-xl p-6">
            <slot></slot>
        </div>
    </div>

    <footer class="backdrop-blur-lg bg-[#1e1e2e]/70 border-t border-[#6e6c7e]/20 text-[#cdd6f4] py-4 mt-auto">
        <div class="container mx-auto px-4 text-center text-sm">
            Copyright &copy; 2024
            <a
                href="https://smartlinux.xyz"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[#89b4fa] hover:text-[#cba6f7] hover:underline transition duration-200"
            >
                Smartlinux.xyz
            </a>. All rights deserved.
            <p>Commit: {import.meta.env.VITE_COMMIT_HASH}</p>
        </div>
    </footer>
</main>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap");

    :global(body) {
        font-family: "Ubuntu", sans-serif;
        color: #cdd6f4;
        margin: 0;
        background: #1e1e2e;
    }
</style>