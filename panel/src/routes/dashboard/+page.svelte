<script>
    import Alert from "$lib/components/Alert.svelte";
    import { formatBytes, getFileIcon } from "$lib/utils/index.js";
    
    export let data;
    
    let files = data.files;
    let uploading = false;
    let uploadProgress = 0;
    let showAlert = false;
    let alertMessage = "";
    let alertType = "info";
    let fileInput;

    async function handleFileUpload() {
        if (!fileInput?.files?.[0]) return;

        uploading = true;
        showAlert = false;

        try {
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);

            const response = await fetch("/api/v1/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Upload failed");
            }

            alertType = "success";
            alertMessage = "File uploaded successfully!";

            window.location.reload();

        } catch (error) {
            alertType = "error";
            alertMessage = error.message;
        } finally {
            uploading = false;
            showAlert = true;
            fileInput.value = "";
        }
    }
</script>

<Alert type={alertType} message={alertMessage} show={showAlert} />

<div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 gap-6">
        <!-- Upload Section -->
        <div class="backdrop-blur-lg bg-[#1e1e2e]/70 border border-[#6e6c7e]/20 rounded-xl shadow-xl p-6">
            <h2 class="text-2xl font-bold text-[#cba6f7] mb-4">Upload Files</h2>
            <div class="flex gap-4 items-center">
                <input
                    type="file"
                    bind:this={fileInput}
                    disabled={uploading}
                    class="flex-1 bg-[#313244]/50 border border-[#6e6c7e]/50 rounded-lg py-2 px-3 
                           text-[#cdd6f4] file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-[#89b4fa] file:text-[#1e1e2e]
                           hover:file:bg-[#74c7ec]"
                />
                <button
                    on:click={handleFileUpload}
                    disabled={uploading}
                    class="bg-gradient-to-r from-[#89b4fa] to-[#cba6f7] hover:from-[#74c7ec] hover:to-[#f5c2e7]
                           text-[#1e1e2e] font-bold py-2.5 px-6 rounded-lg transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>

        <!-- Files List -->
        <div class="backdrop-blur-lg bg-[#1e1e2e]/70 border border-[#6e6c7e]/20 rounded-xl shadow-xl p-6">
            <h2 class="text-2xl font-bold text-[#cba6f7] mb-4">Your Files</h2>
            
            {#if files.length === 0}
                <p class="text-[#cdd6f4] text-center py-8">No files uploaded yet.</p>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#each files as file}
                        <div class="bg-[#313244]/50 rounded-lg p-4 flex items-start gap-3 hover:bg-[#313244]/70 transition-colors">
                            <div class="text-2xl text-[#89b4fa]">
                                {@html getFileIcon(file.name)}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[#cdd6f4] font-medium truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <p class="text-[#6e6c7e] text-sm">
                                    {formatBytes(file.size)}
                                </p>
                                <p class="text-[#6e6c7e] text-sm">
                                    {new Date(file.lastModified).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
