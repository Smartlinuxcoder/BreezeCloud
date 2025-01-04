<!-- +page.svelte -->
<script>
    import { slide } from 'svelte/transition';
    import { formatBytes, getFileIcon, canPreview } from '$lib/utils';
    
    export let data;
    
    let files = data.files;
    let uploading = false;
    let alert = { show: false, type: '', message: '' };
    let fileInput;
    let viewMode = 'grid';
    let previewModal = false;
    let selectedFile = null;

    function showAlert(type, message, duration = 3000) {
        alert = { show: true, type, message };
        setTimeout(() => {
            alert.show = false;
        }, duration);
    }

    function openPreview(file) {
        if (canPreview(file.name)) {
            selectedFile = file;
            previewModal = true;
        }
    }

    async function downloadFile(filename, event) {
        event?.stopPropagation();
        try {
            const response = await fetch(`/api/v1/download?file=${encodeURIComponent(filename)}`);
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            showAlert('error', error.message);
        }
    }

    async function handleFileUpload() {
        if (!fileInput?.files?.[0]) return;
        uploading = true;
        alert.show = false;

        try {
            const formData = new FormData();
            formData.append("file", fileInput.files[0]);

            const response = await fetch("/api/v1/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Upload failed");

            showAlert('success', "File uploaded successfully!");
            // Refresh the page to show new file
            window.location.reload();
        } catch (error) {
            showAlert('error', error.message);
        } finally {
            uploading = false;
            fileInput.value = "";
        }
    }
</script>

{#if alert.show}
    <div
        transition:slide
        class="fixed top-4 right-4 z-50 max-w-sm"
        role="alert"
    >
        <div class="{alert.type === 'error' ? 'bg-red-50 text-red-500 border-red-500' : 'bg-green-50 text-green-500 border-green-500'} 
                    p-4 rounded-lg border shadow-lg flex items-center gap-3"
        >
            <span class="material-icons">
                {alert.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <p>{alert.message}</p>
        </div>
    </div>
{/if}

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Files</h1>
            
            <div class="flex items-center gap-4">
                <button
                    class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    on:click={() => viewMode = viewMode === 'grid' ? 'list' : 'grid'}
                >
                    <span class="material-icons">
                        {viewMode === 'grid' ? 'view_list' : 'grid_view'}
                    </span>
                </button>

                <div class="relative">
                    <input
                        type="file"
                        bind:this={fileInput}
                        on:change={handleFileUpload}
                        disabled={uploading}
                        class="hidden"
                        id="file-upload"
                    />
                    <label
                        for="file-upload"
                        class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
                    >
                        <span class="material-icons">upload</span>
                        Upload
                    </label>
                </div>
            </div>
        </div>

        <!-- Files Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {#if files.length === 0}
                <div class="text-center py-32" transition:slide>
                    <span class="material-icons text-6xl text-gray-400 mb-4">cloud_upload</span>
                    <p class="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
                    <p class="text-sm text-gray-400 dark:text-gray-500">Upload your first file to get started</p>
                </div>
            {:else}
                <div class="p-4 {viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}">
                    {#each files as file}
                        <div
                            class="group {viewMode === 'grid' 
                                ? 'p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50' 
                                : 'flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
                            on:click={() => openPreview(file)}
                        >
                            <div class={viewMode === 'grid' ? 'text-center' : 'flex items-center gap-4 flex-1'}>
                                <div class="text-blue-500">
                                    {@html getFileIcon(file.name)}
                                </div>
                                <div class={viewMode === 'grid' ? 'mt-3' : 'flex-1'}>
                                    <p class="font-medium text-gray-900 dark:text-white truncate">
                                        {file.name}
                                    </p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        {formatBytes(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                                on:click={(e) => downloadFile(file.name, e)}
                            >
                                <span class="material-icons">download</span>
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Preview Modal -->
{#if previewModal && selectedFile}
    <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        on:click={() => previewModal = false}
    >
        <div 
            class="max-w-4xl w-full mx-4"
            on:click|stopPropagation
        >
            <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 class="font-semibold text-gray-900 dark:text-white">{selectedFile.name}</h3>
                    <button
                        class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        on:click={() => previewModal = false}
                    >
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="p-4">
                    {#if selectedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)}
                        <img
                            src={`/api/v1/download?file=${encodeURIComponent(selectedFile.name)}`}
                            alt={selectedFile.name}
                            class="max-h-[70vh] mx-auto"
                        />
                    {:else if selectedFile.name.match(/\.pdf$/i)}
                        <iframe
                            src={`/api/v1/download?file=${encodeURIComponent(selectedFile.name)}`}
                            class="w-full h-[70vh]"
                            title={selectedFile.name}
                        ></iframe>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>