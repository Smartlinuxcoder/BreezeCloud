<script>
    import { slide } from "svelte/transition";
    import { formatBytes, getFileIcon, canPreview } from "$lib/utils";
    import { confirmModal } from "$lib/stores/modal";
    import ConfirmModal from "$lib/components/Confirmation.svelte";
    import { onMount } from "svelte";
    import hljs from "highlight.js";
    import "highlight.js/styles/github-dark.css";
    import { marked } from "marked";
    import {
        Upload,
        FolderPlus,
        Check,
        AlertCircle,
        Grid,
        List,
        ArrowUp,
        Folder,
        File,
        FileText,
        Image as ImageIcon,
        Code,
        X,
        Download,
        RefreshCw,
        HardDrive,
        FileEdit,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    export let data;

    let files = data.files;
    let uploading = false;
    let alert = { show: false, type: "", message: "" };
    let fileInput;
    let viewMode = "grid";
    let previewModal = false;
    let selectedFile = null;
    let downloadingFiles = new Set();
    let loadingPreview = false;
    let deletingFiles = new Set();
    let renamingFiles = new Set();
    let previewContent = "";
    let currentPath = [];
    let currentFolder = data.files;
    let uploadProgress = new Map();
    let totalUploadProgress = 0;

    function showAlert(type, message, duration = 3000) {
        alert = { show: true, type, message };
        setTimeout(() => {
            alert.show = false;
        }, duration);
    }

    // Initialize currentPath from URL
    $: {
        const pathParam = $page.url.searchParams.get("path");
        if (pathParam) {
            currentPath = pathParam.split("/").filter(Boolean);
            currentFolder = getCurrentFolder();
        }
    }

    // Update URL when path changes
    $: if (browser) {
        const url = new URL(window.location);
        if (currentPath.length > 0) {
            url.searchParams.set("path", currentPath.join("/"));
        } else {
            url.searchParams.delete("path");
        }
        goto(url, { replaceState: true });
    }

    async function loadPreview(file) {
        loadingPreview = true;
        try {
            const filePath = [...currentPath, file.name].join("/");
            const response = await fetch(
                `/api/v1/download?file=${encodeURIComponent(filePath)}`,
            );
            if (!response.ok) throw new Error("Failed to load preview");

            // Handle different file types
            if (
                file.name.match(
                    /\.(txt|md|js|py|java|cpp|h|c|css|html|json|yaml|yml|xml|svg|sh|ini|config|log)$/i,
                )
            ) {
                const text = await response.text();

                // Handle markdown files
                if (file.name.endsWith(".md")) {
                    previewContent = marked(text);
                } else {
                    // Apply syntax highlighting for code files
                    const extension = file.name.split(".").pop().toLowerCase();
                    previewContent = hljs.highlightAuto(text).value;
                }
            }
        } catch (error) {
            showAlert("error", "Failed to load preview");
        } finally {
            loadingPreview = false;
        }
    }

    async function openPreview(file, name) {
        if (!file || !name) return;

        selectedFile = {
            ...file,
            name,
        };
        previewModal = true;
        loadingPreview = true;

        if (canPreview(name)) {
            await loadPreview({ ...file, name });
        }
    }

    async function downloadFile(filename, event) {
        if (!browser || !filename) return;
        event?.stopPropagation();
        if (downloadingFiles.has(filename)) return;

        downloadingFiles.add(filename);
        try {
            const filePath = [...currentPath, filename].join("/");
            const response = await fetch(
                `/api/v1/download?file=${encodeURIComponent(filePath)}`,
            );
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            downloadingFiles.delete(filename);
        }
    }

    async function handleFileUpload() {
        if (!fileInput?.files?.length) return;
        uploading = true;
        alert.show = false;
        uploadProgress.clear();
        totalUploadProgress = 0;

        try {
            const files = Array.from(fileInput.files);
            const uploads = files.map(async (file) => {
                uploadProgress.set(file.name, 0);
                uploadProgress = uploadProgress;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", currentPath.join("/"));

                const xhr = new XMLHttpRequest();
                
                // Track individual file progress
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const progress = (e.loaded / e.total) * 100;
                        uploadProgress.set(file.name, progress);
                        uploadProgress = uploadProgress;
                        
                        // Calculate total progress
                        totalUploadProgress = Array.from(uploadProgress.values()).reduce((a, b) => a + b, 0) / files.length;
                    }
                };

                return new Promise((resolve, reject) => {
                    xhr.open("POST", "/api/v1/upload");
                    
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(xhr.response);
                        } else {
                            reject(new Error(xhr.statusText));
                        }
                    };
                    
                    xhr.onerror = () => reject(new Error("Upload failed"));
                    xhr.send(formData);
                });
            });

            await Promise.all(uploads);
            showAlert("success", "Files uploaded successfully!");
            window.location.reload();
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            uploading = false;
            fileInput.value = "";
            uploadProgress.clear();
            totalUploadProgress = 0;
        }
    }

    async function deleteFile(filename, event) {
        event?.stopPropagation();
        if (deletingFiles.has(filename)) return;

        $confirmModal = {
            show: true,
            title: "Delete File",
            message: `Are you sure you want to delete ${filename}?`,
            onConfirm: async () => {
                deletingFiles.add(filename);
                try {
                    const response = await fetch("/api/v1/delete", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filename }),
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || "Failed to delete file");
                    }

                    delete currentFolder[filename];
                    currentFolder = currentFolder;
                    showAlert("success", "File deleted successfully");
                } catch (error) {
                    showAlert("error", error.message);
                } finally {
                    deletingFiles.delete(filename);
                }
            },
        };
    }

    async function renameFile(filename, event) {
        event?.stopPropagation();
        if (renamingFiles.has(filename)) return;

        const newName = prompt("Enter new name:", filename);
        if (!newName || newName === filename) return;

        renamingFiles.add(filename);
        try {
            const oldPath = [...currentPath, filename].join("/");
            const newPath = [...currentPath, newName].join("/");

            const response = await fetch("/api/v1/rename", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPath, newPath }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to rename file");
            }

            // Update local state
            const item = currentFolder[filename];
            delete currentFolder[filename];
            currentFolder[newName] = item;
            currentFolder = currentFolder;
            showAlert("success", "File renamed successfully");
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            renamingFiles.delete(filename);
        }
    }

    function navigateToFolder(folderName) {
        currentPath = [...currentPath, folderName];
        currentFolder = getCurrentFolder().children;
    }

    function navigateUp() {
        currentPath.pop();
        currentFolder = getCurrentFolder();
        currentPath = currentPath; // trigger reactivity
    }

    function getCurrentFolder() {
        let folder = data.files;
        for (const pathPart of currentPath) {
            folder = folder[pathPart].children;
        }
        return folder;
    }

    async function createFolder() {
        const folderName = prompt("Enter folder name:");
        if (!folderName) return;

        const path = [...currentPath, folderName].join("/");

        try {
            const response = await fetch("/api/v1/upload/folder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folderPath: path }),
            });

            if (!response.ok) throw new Error("Failed to create folder");
            window.location.reload();
        } catch (error) {
            showAlert("error", error.message);
        }
    }

    function getFileIconComponent(filename) {
        if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return ImageIcon;
        if (filename.match(/\.(txt|md)$/i)) return FileText;
        if (filename.match(/\.(js|py|java|cpp|h|c|css|html)$/i)) return Code;
        return File;
    }

    onMount(() => {
        if (browser) {
            const pathParam = new URL(window.location).searchParams.get("path");
            if (pathParam) {
                currentPath = pathParam.split("/").filter(Boolean);
                currentFolder = getCurrentFolder();
            }
        }
    });
</script>

<!-- Alert component -->
{#if alert.show}
    <div
        transition:slide
        class="fixed top-4 right-4 z-50 max-w-sm"
        role="alert"
    >
        <div
            class="{alert.type === 'error'
                ? 'bg-[#302234] text-[#F38BA8] border-[#F38BA8]'
                : 'bg-[#2d323b] text-[#A6E3A1] border-[#A6E3A1]'} 
                    p-4 rounded-lg border shadow-lg flex items-center gap-3"
        >
            {#if alert.type === "error"}
                <AlertCircle size={24} />
            {:else}
                <Check size={24} />
            {/if}
            <p>{alert.message}</p>
        </div>
    </div>
{/if}

<div class="min-h-screen bg-[#1E1E2E] p-4">
    <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
            <div class="flex flex-col gap-2">
                <h1 class="text-2xl font-semibold text-[#CDD6F4]">Files</h1>
                <div class="flex items-center gap-2 text-[#6C7086]">
                    <HardDrive size={16} />
                    <div
                        class="w-48 h-2 bg-[#313244] rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full bg-[#89B4FA] transition-all"
                            style="width: {(data.user.storageUsed /
                                data.user.storageQuota) *
                                100}%"
                        />
                    </div>
                    <span class="text-sm">
                        {formatBytes(data.user.storageUsed)} / {formatBytes(
                            data.user.storageQuota,
                        )}
                    </span>
                </div>
            </div>
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <button
                    class="p-2 rounded-lg hover:bg-[#313244] text-[#CDD6F4]"
                    on:click={() =>
                        (viewMode = viewMode === "grid" ? "list" : "grid")}
                >
                    {#if viewMode === "grid"}
                        <List size={24} />
                    {:else}
                        <Grid size={24} />
                    {/if}
                </button>

                <div class="relative flex-1 sm:flex-none">
                    <input
                        type="file"
                        bind:this={fileInput}
                        on:change={handleFileUpload}
                        disabled={uploading}
                        class="hidden"
                        id="file-upload"
                        multiple
                    />
                    <label
                        for="file-upload"
                        class="flex items-center gap-2 px-4 py-2 bg-[#89B4FA] hover:bg-[#74C7EC]
                               text-[#1E1E2E] rounded-lg cursor-pointer disabled:opacity-50
                               disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                        class:opacity-50={uploading}
                    >
                        {#if uploading}
                            <RefreshCw size={24} class="animate-spin" />
                        {:else}
                            <Upload size={24} />
                        {/if}
                        {uploading ? "Uploading..." : "Upload"}
                    </label>
                </div>
            </div>
        </div>

        <!-- Breadcrumb Navigation -->
        <div class="flex items-center gap-2 text-[#CDD6F4] mb-4">
            <button
                class="hover:text-[#89B4FA]"
                on:click={() => {
                    currentPath = [];
                    currentFolder = data.files;
                }}
            >
                Home
            </button>
            {#each currentPath as folder, i}
                <span>/</span>
                <button
                    class="hover:text-[#89B4FA]"
                    on:click={() => {
                        currentPath = currentPath.slice(0, i + 1);
                        currentFolder = getCurrentFolder();
                    }}
                >
                    {folder}
                </button>
            {/each}
        </div>

        <div class="flex items-center gap-4">
            <button
                on:click={createFolder}
                class="flex items-center gap-2 px-4 py-2 bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] rounded-lg"
            >
                <FolderPlus size={24} />
                New Folder
            </button>
        </div>

        <!-- Files Section -->
        <div class="bg-[#181825] rounded-xl shadow-sm border border-[#313244]">
            {#if Object.keys(currentFolder).length === 0}
                <div class="text-center py-32" transition:slide>
                    <Upload size={48} class="text-[#6C7086] mb-4 mx-auto" />
                    <p class="text-[#CDD6F4]">No files uploaded yet</p>
                    <p class="text-sm text-[#6C7086]">
                        Upload your first file to get started
                    </p>
                </div>
            {:else}
                <div
                    class="p-4 {viewMode === 'grid'
                        ? 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
                        : 'space-y-2'}"
                >
                    {#if currentPath.length > 0}
                        <div
                            class="group p-3 rounded-lg hover:bg-[#313244] cursor-pointer"
                            on:click={navigateUp}
                        >
                            <div class="flex items-center gap-4">
                                <ArrowUp size={24} class="text-[#89B4FA]" />
                                <span class="text-[#CDD6F4]">..</span>
                            </div>
                        </div>
                    {/if}

                    {#each Object.entries(currentFolder) as [name, item]}
                        <div
                            class="group p-3 rounded-lg hover:bg-[#313244] cursor-pointer"
                            on:click={() =>
                                item.type === "folder"
                                    ? navigateToFolder(name)
                                    : openPreview(item, name)}
                        >
                            <div class="flex items-center gap-4">
                                <svelte:component
                                    this={item.type === "folder"
                                        ? Folder
                                        : getFileIconComponent(name)}
                                    size={24}
                                    class="text-[#89B4FA]"
                                />
                                <div class="flex-1">
                                    <p class="text-[#CDD6F4] truncate">
                                        {name}
                                    </p>
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <p class="text-sm text-[#6C7086]">
                                            {item.type === "folder"
                                                ? `${Object.keys(item.children).length} items`
                                                : `${formatBytes(item.size)} • ${new Date(item.modified).toLocaleDateString()}`}
                                        </p>
                                        {#if item.type !== "folder"}
                                            <div
                                                class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <button
                                                    class="p-1.5 rounded-lg hover:bg-[#45475A] text-[#CDD6F4]"
                                                    on:click={(e) =>
                                                        downloadFile(name, e)}
                                                    disabled={downloadingFiles.has(
                                                        name,
                                                    )}
                                                >
                                                    {#if downloadingFiles.has(name)}
                                                        <RefreshCw
                                                            size={18}
                                                            class="animate-spin"
                                                        />
                                                    {:else}
                                                        <Download size={18} />
                                                    {/if}
                                                </button>
                                                <button
                                                    class="p-1.5 rounded-lg hover:bg-[#45475A] text-[#F38BA8]"
                                                    on:click={(e) =>
                                                        deleteFile(name, e)}
                                                    disabled={deletingFiles.has(
                                                        name,
                                                    )}
                                                >
                                                    {#if deletingFiles.has(name)}
                                                        <RefreshCw
                                                            size={18}
                                                            class="animate-spin"
                                                        />
                                                    {:else}
                                                        <X size={18} />
                                                    {/if}
                                                </button>
                                                <button
                                                    class="p-1.5 rounded-lg hover:bg-[#45475A] text-[#CDD6F4]"
                                                    on:click={(e) =>
                                                        renameFile(name, e)}
                                                    disabled={renamingFiles.has(
                                                        name,
                                                    )}
                                                >
                                                    <FileEdit size={18} />
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
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
        on:click={() => (previewModal = false)}
    >
        <div class="max-w-4xl w-full" on:click|stopPropagation>
            <div class="bg-[#1E1E2E] rounded-xl overflow-hidden">
                <div
                    class="p-4 border-b border-[#313244] flex justify-between items-center"
                >
                    <h3 class="font-semibold text-[#CDD6F4]">
                        {selectedFile.name}
                    </h3>
                    <button
                        class="p-2 rounded-full hover:bg-[#313244] text-[#CDD6F4]"
                        on:click={() => (previewModal = false)}
                    >
                        <X size={24} />
                    </button>
                </div>
                <div class="p-4">
                    {#if loadingPreview}
                        <div class="flex items-center justify-center h-[70vh]">
                            <RefreshCw
                                size={48}
                                class="text-[#89B4FA] animate-spin"
                            />
                        </div>
                    {/if}

                    {#if selectedFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)}
                        <img
                            src={`/api/v1/download?file=${encodeURIComponent([...currentPath, selectedFile.name].join("/"))}`}
                            alt={selectedFile.name}
                            class="max-h-[70vh] mx-auto object-contain"
                            class:hidden={loadingPreview}
                            on:load={() => (loadingPreview = false)}
                        />
                    {:else if selectedFile.name.match(/\.pdf$/i)}
                        <iframe
                            src={`/api/v1/download?file=${encodeURIComponent([...currentPath, selectedFile.name].join("/"))}#view=FitH`}
                            class="w-full h-[70vh]"
                            class:hidden={loadingPreview}
                            on:load={() => (loadingPreview = false)}
                            title={selectedFile.name}
                        ></iframe>
                    {:else if selectedFile.name.match(/\.(txt|md|js|py|java|cpp|h|c|css|html|json|yaml|yml|xml|svg|sh|ini|config|log)$/i)}
                        <div
                            class="bg-[#11111b] rounded-lg p-4 max-h-[70vh] overflow-auto"
                        >
                            {#if selectedFile.name.endsWith(".md")}
                                {@html previewContent}
                            {:else}
                                <pre><code class="hljs"
                                        >{@html previewContent}</code
                                    ></pre>
                            {/if}
                        </div>
                    {:else if selectedFile.name.match(/\.(mp3|wav|flac|ogg|m4a)$/i)}
                        <div class="flex flex-col items-center justify-center p-4">
                            <div class="w-full max-w-lg bg-[#11111b] rounded-lg p-4">
                                <audio 
                                    controls
                                    class="w-full"
                                    src={`/api/v1/download?file=${encodeURIComponent([...currentPath, selectedFile.name].join("/"))}`}
                                    on:load={() => (loadingPreview = false)}
                                >
                                    Your browser does not support the audio element.
                                    Bruh what are you using?
                                </audio>
                            </div>
                        </div>
                    {:else}
                        <div
                            class="flex flex-col items-center justify-center h-[70vh] text-[#6C7086]"
                        >
                            <File size={48} class="mb-4" />
                            <p>Preview not available</p>
                            <button
                                class="mt-4 px-4 py-2 bg-[#89B4FA] hover:bg-[#74C7EC] text-[#1E1E2E] rounded-lg"
                                on:click={(e) =>
                                    downloadFile(selectedFile.name, e)}
                            >
                                <Download size={24} class="mr-2" />
                                Download File
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

{#if uploading}
    <div class="fixed bottom-4 right-4 bg-[#1E1E2E] p-4 rounded-lg shadow-lg border border-[#313244] max-w-md w-full z-50">
        <div class="flex justify-between items-center mb-2">
            <span class="text-[#CDD6F4] truncate">Uploading files...</span>
            <span class="text-[#89B4FA] ml-2">{Math.round(totalUploadProgress)}%</span>
        </div>
        <div class="w-full h-2 bg-[#313244] rounded-full overflow-hidden">
            <div
                class="h-full bg-[#89B4FA] transition-all"
                style="width: {totalUploadProgress}%"
            />
        </div>
        <div class="mt-2 max-h-32 overflow-y-auto">
            {#each Array.from(uploadProgress) as [filename, progress]}
                <div class="text-sm text-[#6C7086] mt-1 flex justify-between items-center">
                    <span class="truncate flex-1">{filename}</span>
                    <span class="ml-2 flex-shrink-0">{Math.round(progress)}%</span>
                </div>
            {/each}
        </div>
    </div>
{/if}

<ConfirmModal />

<style>
    @import url("https://fonts.googleapis.com/icon?family=Material+Icons");

    @media (min-width: 480px) {
        .xs\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>
