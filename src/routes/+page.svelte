<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Upload, Shield, Clock, Cloud, CloudLightning } from 'lucide-svelte';
    
    let mounted = false;
    onMount(() => {
        mounted = true;
    });

    const catppuccinColors = [
        '#89b4fa', // Blue
        '#f5c2e7', // Pink
        '#94e2d5', // Teal
        '#a6e3a1', // Green
        '#fab387', // Peach
    ];
</script>

<div class="relative min-h-[calc(100vh-12rem)] overflow-hidden">
    <!-- Animated blobs -->
    {#if mounted}
        {#each Array(5) as _, i}
            <div
                in:fade={{ duration: 1000, delay: i * 200 }}
                class="absolute blur-[100px] opacity-30"
                style="
                    background: {catppuccinColors[i]};
                    width: {Math.random() * 400 + 200}px;
                    height: {Math.random() * 400 + 200}px;
                    left: {Math.random() * 100}%;
                    top: {Math.random() * 100}%;
                    transform: translate(-50%, -50%);
                "
            />
        {/each}
    {/if}

    <!-- Content -->
    <div class="relative z-10">
        <main class="container mx-auto px-6 pt-20 pb-32">
            <div class="max-w-3xl mx-auto text-center">
                <h1 
                    in:fly={{ y: 50, duration: 1000 }}
                    class="text-5xl md:text-6xl font-bold text-[#cdd6f4] mb-6 leading-tight"
                >
                    Your Personal Cloud Storage
                </h1>
                <p 
                    in:fly={{ y: 50, duration: 1000, delay: 200 }}
                    class="text-xl text-[#a6adc8] mb-12"
                >
                    Dead simple, fast, expandable.
                </p>
                <div 
                    in:fly={{ y: 50, duration: 1000, delay: 400 }}
                    class="space-x-4"
                >
                    <a
                        href="/register"
                        class="inline-block bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                    >
                        Get Started
                    </a>
                    <a
                        href="/dashboard"
                        class="inline-block text-[#cdd6f4] hover:text-[#89b4fa] px-8 py-4 rounded-lg text-lg font-semibold border border-[#6c7086] hover:border-[#89b4fa] transition-colors"
                    >
                        Open Dashboard
                    </a>
                </div>
            </div>

            <!-- Features -->
            <div 
                in:fly={{ y: 50, duration: 1000, delay: 600 }}
                class="grid md:grid-cols-3 gap-8 mt-32"
            >
                {#each [
                    {
                        icon: Upload,
                        title: "It's easy",
                        description: "Upload your files with a few clicks, you already know how"
                    },
                    {
                        icon: CloudLightning,
                        title: "It's fast",
                        description: "Like, real fast"
                    },
                    {
                        icon: Cloud,
                        title: "Access Anywhere",
                        description: "It's the cloud, dawg"
                    },
                    {
                        icon: Shield,
                        title: "It's secure",
                        description: "Brother, you can self-host if you want"
                    },
                    
                    
                ] as feature}
                    <div class="p-6 rounded-xl bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] hover:border-[#89b4fa] transition-colors">
                        <svelte:component 
                            this={feature.icon}
                            class="w-12 h-12 text-[#89b4fa] mb-4"
                        />
                        <h3 class="text-xl font-semibold text-[#cdd6f4] mb-3">
                            {feature.title}
                        </h3>
                        <p class="text-[#a6adc8]">{feature.description}</p>
                    </div>
                {/each}
            </div>
        </main>
    </div>
</div>