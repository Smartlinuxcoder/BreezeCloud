<script>
    let files;
    let uploading = false;
    let uploadProgress = 0;
    let uploadError = null;

    async function handleFileUpload() {
        if (!files || !files[0]) return;

        uploading = true;
        uploadError = null;

        try {
            const formData = new FormData();
            formData.append("file", files[0]);

            const response = await fetch("/api/v1/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Upload failed");
            }

            // Reset the file input and update status
            files = null;
            uploading = false;
            uploadProgress = 100;

            // You might want to trigger a refresh of the files list here
        } catch (error) {
            uploadError = error.message;
            uploading = false;
        }
    }
</script>

<div class="upload-container">
    <h2>Upload Files</h2>

    <div class="upload-form">
        <input type="file" bind:files disabled={uploading} id="file-upload" />

        <button on:click={handleFileUpload} disabled={!files || uploading}>
            {uploading ? "Uploading..." : "Upload"}
        </button>
    </div>

    {#if uploadError}
        <div class="error">
            {uploadError}
        </div>
    {/if}

    {#if uploading}
        <div class="progress">Uploading...</div>
    {/if}
</div>

<style>
    .upload-container {
        padding: 1rem;
        max-width: 600px;
        margin: 0 auto;
    }

    .upload-form {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
    }

    .error {
        color: red;
        margin-top: 1rem;
    }

    .progress {
        margin-top: 1rem;
        color: #666;
    }

    button {
        padding: 0.5rem 1rem;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
</style>
