export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

export function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
        // Documents
        pdf: 'picture_as_pdf',
        doc: 'description',
        docx: 'description',
        txt: 'article',
        
        // Spreadsheets
        xls: 'table_chart',
        xlsx: 'table_chart',
        csv: 'table_chart',
        
        // Images
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'gif',
        webp: 'image',
        svg: 'image',
        
        // Media
        mp3: 'audio_file',
        wav: 'audio_file',
        mp4: 'video_file',
        mov: 'video_file',
        avi: 'video_file',
        
        // Archives
        zip: 'folder_zip',
        rar: 'folder_zip',
        '7z': 'folder_zip',
        
        // Code
        js: 'code',
        ts: 'code',
        html: 'code',
        css: 'code',
        json: 'code'
    };

    return `<span class="material-icons">${iconMap[ext] || 'insert_drive_file'}</span>`;
}

export function canPreview(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const previewableTypes = [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'webp',
        // Documents
        'pdf',
        // Video
        'mp4', 'webm',
        // Audio
        'mp3', 'wav',
        // Text
        'txt', 'md', 'json', 'js', 'css', 'html'
    ];
    return previewableTypes.includes(ext);
}

export function validateFile(file, maxSize = 100 * 1024 * 1024) { // 100MB default
    if (file.size > maxSize) {
        throw new Error(`File size exceeds ${formatBytes(maxSize)}`);
    }
    
    // Add additional validations as needed
    return true;
}

export async function uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        validateFile(file);

        const xhr = new XMLHttpRequest();
        
        // Setup progress tracking
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                onProgress?.(progress);
            }
        };

        // Return promise for fetch
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            xhr.onerror = () => reject(new Error('Network Error'));
            
            xhr.open('POST', '/api/v1/upload');
            xhr.send(formData);
        });
    } catch (error) {
        throw error;
    }
}