<script>
    export let uploading = false;
    export let uploadProgress = new Map();
    export let totalUploadProgress = 0;

    $: totalUploadProgress = Array.from(uploadProgress.values()).reduce(
        (acc, curr) => acc + curr,
        0
    );
</script>

{#if uploading}
    <div
        class="fixed bottom-4 right-4 bg-[#1E1E2E] p-4 rounded-lg shadow-lg border border-[#313244] max-w-md w-full z-50"
    >
        <div class="flex justify-between items-center mb-2">
            <span class="text-[#CDD6F4] truncate">Uploading files...</span>
            <span class="text-[#89B4FA] ml-2"
                >{Math.round(totalUploadProgress)}%</span
            >
        </div>
        <div class="w-full h-2 bg-[#313244] rounded-full overflow-hidden">
            <div
                class="h-full bg-[#89B4FA] transition-all"
                style="width: {totalUploadProgress}%"
            />
        </div>
        <div class="mt-2 max-h-32 overflow-y-auto">
            {#each Array.from(uploadProgress) as [filename, progress]}
                <div
                    class="text-sm text-[#6C7086] mt-1 flex justify-between items-center"
                >
                    <span class="truncate flex-1">{filename}</span>
                    <span class="ml-2 flex-shrink-0"
                        >{Math.round(progress)}%</span
                    >
                </div>
            {/each}
        </div>
    </div>
{/if}