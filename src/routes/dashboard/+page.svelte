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
    let downloadingFiles = new Set();
    let loadingPreview = false;

    function showAlert(type, message, duration = 3000) {
        alert = { show: true, type, message };
        setTimeout(() => {
            alert.show = false;
        }, duration);
    }

    async function openPreview(file) {
        if (canPreview(file.name)) {
            selectedFile = file;
            previewModal = true;
            loadingPreview = true;
        }
    }

    async function downloadFile(filename, event) {
        event?.stopPropagation();
        if (downloadingFiles.has(filename)) return;
        
        downloadingFiles.add(filename);
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
        } finally {
            downloadingFiles.delete(filename);
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
        <div class="{alert.type === 'error' ? 'bg-[#302234] text-[#F38BA8] border-[#F38BA8]' : 'bg-[#2d323b] text-[#A6E3A1] border-[#A6E3A1]'} 
                    p-4 rounded-lg border shadow-lg flex items-center gap-3"
        >
            <span class="material-icons">
                {alert.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <p>{alert.message}</p>
        </div>
    </div>
{/if}

<div class="min-h-screen bg-[#1E1E2E] p-4">
    <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 class="text-2xl font-semibold text-[#CDD6F4]">Files</h1>
            
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <button
                    class="p-2 rounded-lg hover:bg-[#313244] text-[#CDD6F4]"
                    on:click={() => viewMode = viewMode === 'grid' ? 'list' : 'grid'}
                >
                    <span class="material-icons">
                        {viewMode === 'grid' ? 'view_list' : 'grid_view'}
                    </span>
                </button>

                <div class="relative flex-1 sm:flex-none">
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
                        class="flex items-center gap-2 px-4 py-2 bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                        class:opacity-50={uploading}
                    >
                        <span class="material-icons {uploading ? 'animate-spin' : ''}">{uploading ? 'sync' : 'upload'}</span>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </label>
                </div>
            </div>
        </div>

        <!-- Files Section -->
        <div class="bg-[#181825] rounded-xl shadow-sm border border-[#313244]">
            {#if files.length === 0}
                <div class="text-center py-32" transition:slide>
                    <span class="material-icons text-6xl text-[#6C7086] mb-4">cloud_upload</span>
                    <p class="text-[#CDD6F4]">No files uploaded yet</p>
                    <p class="text-sm text-[#6C7086]">Upload your first file to get started</p>
                </div>
            {:else}
                <div class="p-4 {viewMode === 'grid' ? 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'}">
                    {#each files as file}
                        <div
                            class="group {viewMode === 'grid' 
                                ? 'p-3 rounded-lg hover:bg-[#313244]' 
                                : 'flex items-center p-3 rounded-lg hover:bg-[#313244]'}"
                            on:click={() => openPreview(file)}
                        >
                            <div class={viewMode === 'grid' ? 'text-center' : 'flex items-center gap-4 flex-1'}>
                                <div class="text-[#89B4FA]">
                                    {@html getFileIcon(file.name)}
                                </div>
                                <div class={viewMode === 'grid' ? 'mt-3' : 'flex-1'}>
                                    <p class="font-medium text-[#CDD6F4] truncate">
                                        {file.name}
                                    </p>
                                    <p class="text-sm text-[#6C7086]">
                                        {formatBytes(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                class="p-2 rounded-full hover:bg-[#45475A] text-[#CDD6F4] disabled:opacity-50"
                                on:click={(e) => downloadFile(file.name, e)}
                                disabled={downloadingFiles.has(file.name)}
                            >
                                <span class="material-icons {downloadingFiles.has(file.name) ? 'animate-spin' : ''}">
                                    {downloadingFiles.has(file.name) ? 'sync' : 'download'}
                                </span>
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
        class="fixed inset-0 bg-[#181825]/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        on:click={() => previewModal = false}
    >
        <div 
            class="max-w-4xl w-full"
            on:click|stopPropagation
        >
            <div class="bg-[#1E1E2E] rounded-xl overflow-hidden">
                <div class="p-4 border-b border-[#313244] flex justify-between items-center">
                    <h3 class="font-semibold text-[#CDD6F4]">{selectedFile.name}</h3>
                    <button
                        class="p-2 rounded-full hover:bg-[#313244] text-[#CDD6F4]"
                        on:click={() => previewModal = false}
                    >
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="p-4">
                    {#if loadingPreview}
                        <div class="flex items-center justify-center h-[70vh]">
                            <span class="material-icons text-[#89B4FA] animate-spin text-4xl">sync</span>
                        </div>
                    {/if}
                    
                    {#if selectedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)}
                        <img
                            src={`/api/v1/download?file=${encodeURIComponent(selectedFile.name)}`}
                            alt={selectedFile.name}
                            class="max-h-[70vh] mx-auto"
                            class:hidden={loadingPreview}
                            on:load={() => loadingPreview = false}
                        />
                    {:else if selectedFile.name.match(/\.pdf$/i)}
                        <iframe
                            src={`/api/v1/download?file=${encodeURIComponent(selectedFile.name)}`}
                            class="w-full h-[70vh]"
                            class:hidden={loadingPreview}
                            on:load={() => loadingPreview = false}
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

    @media (min-width: 480px) {
        .xs\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>