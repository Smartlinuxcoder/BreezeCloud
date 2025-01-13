<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import hljs from "highlight.js";
    import "@catppuccin/highlightjs/css/catppuccin-mocha.css";
    import { marked } from "marked";
    import { X, RefreshCw, Download, File, AlertCircle } from "lucide-svelte";
    import { env } from "$env/dynamic/public";

    let loadingPreview = true;
    let previewContent = "";
    let error = null;
    let mediaType = "";
    let absoluteUrl = ""; 
    
    $: user = $page.params.user;
    $: filename = $page.params.filename;
    $: filePath = `/${user}/${filename}`;

    $: {
        if (filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            mediaType = "image";
        } else if (filename?.match(/\.(mp4|webm|mov|avi)$/i)) {
            mediaType = "video";
        } else {
            mediaType = "file";
        }
        
        const baseUrl = env.PUBLIC_URL; 
        absoluteUrl = `${baseUrl}/api/v1/public/download?file=${encodeURIComponent(filePath)}`;
    }

    async function loadPreview() {
        error = null;
        loadingPreview = true;
        
        if (!user || !filename) {
            error = "Invalid file path";
            loadingPreview = false;
            return;
        }

        try {
            const response = await fetch(`/api/v1/public/download?file=${encodeURIComponent(filePath)}`);
            if (!response.ok) throw new Error(`Failed to load preview: ${response.statusText}`);

            if (filename.match(/\.(txt|md|js|py|java|cpp|h|c|css|html|json|yaml|yml|xml|svg|sh|ini|config|log)$/i)) {
                const text = await response.text();

                if (filename.endsWith(".md")) {
                    previewContent = marked(text);
                } else {
                    previewContent = hljs.highlightAuto(text).value;
                }
            }
        } catch (err) {
            error = err.message;
            console.error("Failed to load preview:", err);
        } finally {
            loadingPreview = false;
        }
    }

    onMount(() => {
        loadPreview();
    });
</script>

<svelte:head>
    <title>{filename} - Shared by {user}</title>
    <meta name="description" content={`View {filename} shared by {user} on BreezeCloud`} />
    
    <meta property="og:title" content={`${filename} - Shared by ${user}`} />
    <meta property="og:description" content={`View ${filename} shared by ${user} on BreezeCloud`} />
    <meta property="og:url" content={window?.location?.href} />
    
    {#if mediaType === "image"}
        <meta property="og:image" content={absoluteUrl} />
        <meta property="og:type" content="image" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={absoluteUrl} />
    {:else if mediaType === "video"}
        <meta property="og:video" content={absoluteUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:player" content={absoluteUrl} />
    {:else}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
    {/if}
    
    <meta name="twitter:title" content={`${filename} - Shared by {user}`} />
    <meta name="twitter:description" content={`View ${filename} shared by ${user} on BreezeCloud`} />
</svelte:head>

<div class="min-h-screen bg-[#1E1E2E] p-6 rounded-lg">
    <div class="max-w-4xl mx-auto">
        <div class="bg-[#1E1E2E] rounded-xl overflow-hidden">
            <div class="p-4 border-b border-[#313244] flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <h3 class="font-semibold text-[#CDD6F4]">{filename}</h3>
                    <a
                        href={`/api/v1/public/download?file=${encodeURIComponent(filePath)}`}
                        download={filename}
                        class="p-2 rounded-lg hover:bg-[#313244] transition-colors text-[#89B4FA]"
                        title="Download file"
                    >
                        <Download size={20} />
                    </a>
                </div>
                <div class="text-[#6C7086] text-sm">User: {user}</div>
            </div>
            <div class="p-4">
                {#if loadingPreview}
                    <div class="flex flex-col items-center justify-center h-[70vh] gap-4">
                        <RefreshCw size={48} class="text-[#89B4FA] animate-spin" />
                        <p class="text-[#CDD6F4]">Loading preview...</p>
                    </div>
                {:else if error}
                    <div class="flex flex-col items-center justify-center h-[70vh] gap-4 text-[#F38BA8]">
                        <AlertCircle size={48} />
                        <p>{error}</p>
                        <button 
                            class="px-4 py-2 bg-[#313244] rounded-lg hover:bg-[#45475A] transition-colors"
                            on:click={loadPreview}
                        >
                            <RefreshCw size={16} class="inline mr-2" />
                            Retry
                        </button>
                    </div>
                {:else if filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)}
                    <img
                        src={`/api/v1/public/download?file=${encodeURIComponent(filePath)}`}
                        alt={filename}
                        class="max-h-[70vh] mx-auto object-contain"
                        on:error={() => error = "Failed to load image"}
                    />
                {:else if filename.match(/\.(mp4|webm|mov|avi)$/i)}
                    <div class="flex flex-col items-center justify-center p-4">
                        <div class="w-full max-w-4xl bg-[#11111b] rounded-lg p-4">
                            <video
                                controls
                                class="w-full rounded-lg"
                                src={`/api/v1/public/download?file=${encodeURIComponent(filePath)}`}
                                on:load={() => (loadingPreview = false)}
                            >
                                Your browser does not support the video element.
                            </video>
                        </div>
                    </div>
                {:else if filename.match(/\.pdf$/i)}
                    <div class="flex flex-col items-center justify-center p-4">
                        <div class="w-full h-[70vh] bg-[#11111b] rounded-lg p-4">
                            <iframe
                                src={`/api/v1/public/download?file=${encodeURIComponent(filePath)}#view=FitH`}
                                class="w-full h-full rounded-lg"
                                title={filename}
                                on:load={() => (loadingPreview = false)}
                            ></iframe>
                        </div>
                    </div>
                {:else if filename.match(/\.(txt|md|js|py|java|cpp|h|c|css|html|json|yaml|yml|xml|svg|sh|ini|config|log)$/i)}
                    <div class="bg-[#11111b] rounded-lg p-4 max-h-[70vh] overflow-auto">
                        {#if filename.endsWith(".md")}
                            {@html previewContent}
                        {:else}
                            <pre><code class="hljs">{@html previewContent}</code></pre>
                        {/if}
                    </div>
                {:else if filename.match(/\.(mp3|wav|flac|ogg|m4a)$/i)}
                    <div class="flex flex-col items-center justify-center p-4">
                        <div class="w-full max-w-lg bg-[#11111b] rounded-lg p-4">
                            <audio
                                controls
                                class="w-full"
                                src={`/api/v1/public/download?file=${encodeURIComponent(filePath)}`}
                                on:load={() => (loadingPreview = false)}
                            >
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </div>
                {:else}
                    <div class="flex flex-col items-center justify-center h-[70vh] text-[#6C7086]">
                        <File size={48} class="mb-4" />
                        <p>Preview not available</p>
                    </div>
                {/if}
                
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>