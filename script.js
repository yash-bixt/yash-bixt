class PDFMerger {
    constructor() {
        this.files = [];
        this.mergedPdfBlob = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Upload area events
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseText = uploadArea.querySelector('.browse-text');

        // Click events
        uploadArea.addEventListener('click', () => fileInput.click());
        browseText.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // Drag and drop events
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Button events
        document.getElementById('clearAllBtn').addEventListener('click', this.clearAllFiles.bind(this));
        document.getElementById('mergeBtn').addEventListener('click', this.mergePDFs.bind(this));
        document.getElementById('downloadBtn').addEventListener('click', this.downloadMergedPDF.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restart.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        this.processFiles(droppedFiles);
    }

    handleFileSelect(e) {
        const selectedFiles = Array.from(e.target.files);
        this.processFiles(selectedFiles);
    }

    processFiles(files) {
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            this.showNotification('Please select PDF files only.', 'error');
            return;
        }

        if (pdfFiles.length !== files.length) {
            this.showNotification(`${files.length - pdfFiles.length} non-PDF files were ignored.`, 'warning');
        }

        pdfFiles.forEach(file => {
            if (!this.files.some(f => f.name === file.name && f.size === file.size)) {
                this.files.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: this.formatFileSize(file.size)
                });
            }
        });

        this.updateFileList();
        this.showFileListSection();
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.files.forEach((fileData, index) => {
            const fileItem = this.createFileItem(fileData, index);
            fileList.appendChild(fileItem);
        });

        // Update merge button state
        const mergeBtn = document.getElementById('mergeBtn');
        mergeBtn.disabled = this.files.length < 2;
    }

    createFileItem(fileData, index) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="file-details">
                    <h4>${fileData.name}</h4>
                    <p>${fileData.size}</p>
                </div>
            </div>
            <div class="file-actions">
                <button class="move-btn" onclick="pdfMerger.moveFileUp(${index})" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-up"></i>
                </button>
                <button class="move-btn" onclick="pdfMerger.moveFileDown(${index})" ${index === this.files.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <button class="remove-btn" onclick="pdfMerger.removeFile(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return div;
    }

    moveFileUp(index) {
        if (index > 0) {
            [this.files[index], this.files[index - 1]] = [this.files[index - 1], this.files[index]];
            this.updateFileList();
        }
    }

    moveFileDown(index) {
        if (index < this.files.length - 1) {
            [this.files[index], this.files[index + 1]] = [this.files[index + 1], this.files[index]];
            this.updateFileList();
        }
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileList();
        
        if (this.files.length === 0) {
            this.hideFileListSection();
        }
    }

    clearAllFiles() {
        this.files = [];
        this.hideFileListSection();
        document.getElementById('fileInput').value = '';
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            this.showNotification('Please select at least 2 PDF files to merge.', 'error');
            return;
        }

        this.showProgressSection();
        
        try {
            // For this demo, we'll simulate the merging process
            // In a real implementation, you would use PDF-lib or send files to a server
            
            for (let i = 0; i <= 100; i += 10) {
                this.updateProgress(i, `Processing files... ${i}%`);
                await this.delay(100);
            }

            // Create a simple merged file for demonstration
            // In a real scenario, this would be the actual merged PDF
            const mergedContent = await this.createDemoMergedPDF();
            this.mergedPdfBlob = new Blob([mergedContent], { type: 'application/pdf' });
            
            // Show success section
            setTimeout(() => {
                this.showSuccessSection();
            }, 500);
            
        } catch (error) {
            console.error('Error merging PDFs:', error);
            this.showNotification('Error merging PDFs. Please try again.', 'error');
            this.hideProgressSection();
        }
    }

    async createDemoMergedPDF() {
        // Create a simple demo PDF content
        // This is a basic PDF structure for demonstration
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
100 700 Td
(Merged PDF - Demo File) Tj
100 650 Td
(Files merged: ${this.files.length}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000424 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
517
%%EOF`;

        return new TextEncoder().encode(pdfContent);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}%`;
        
        if (text) {
            const progressSection = document.getElementById('progressSection');
            const progressMessage = progressSection.querySelector('h3');
            progressMessage.textContent = text;
        }
    }

    downloadMergedPDF() {
        if (!this.mergedPdfBlob) {
            this.showNotification('No merged PDF available for download.', 'error');
            return;
        }

        // Create download link
        const url = URL.createObjectURL(this.mergedPdfBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `merged-pdf-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
        
        this.showNotification('PDF downloaded successfully!', 'success');
    }

    restart() {
        this.files = [];
        this.mergedPdfBlob = null;
        document.getElementById('fileInput').value = '';
        this.hideAllSections();
        this.showUploadSection();
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add notification styles if not already added
        if (!document.querySelector('.notification-styles')) {
            const style = document.createElement('style');
            style.className = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    z-index: 1000;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                .notification-error { border-left: 4px solid #ff6b6b; }
                .notification-success { border-left: 4px solid #4ecdc4; }
                .notification-warning { border-left: 4px solid #ffa726; }
                .notification-info { border-left: 4px solid #667eea; }
                .notification i { font-size: 1.2rem; }
                .notification-error i { color: #ff6b6b; }
                .notification-success i { color: #4ecdc4; }
                .notification-warning i { color: #ffa726; }
                .notification-info i { color: #667eea; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Section visibility methods
    showFileListSection() {
        document.getElementById('fileListSection').style.display = 'block';
    }

    hideFileListSection() {
        document.getElementById('fileListSection').style.display = 'none';
    }

    showProgressSection() {
        this.hideAllSections();
        document.getElementById('progressSection').style.display = 'block';
    }

    hideProgressSection() {
        document.getElementById('progressSection').style.display = 'none';
    }

    showSuccessSection() {
        this.hideAllSections();
        document.getElementById('successSection').style.display = 'block';
    }

    showUploadSection() {
        document.querySelector('.upload-section').style.display = 'block';
    }

    hideAllSections() {
        document.getElementById('fileListSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('successSection').style.display = 'none';
    }
}

// Initialize the PDF Merger when the page loads
let pdfMerger;

document.addEventListener('DOMContentLoaded', () => {
    pdfMerger = new PDFMerger();
    
    // Add info about the demo version
    setTimeout(() => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            font-size: 0.9rem;
            max-width: 300px;
            z-index: 1000;
        `;
        notification.innerHTML = `
            <strong>Demo Mode</strong><br>
            This creates a demo PDF for testing. For production use, integrate with PDF-lib or a server-side solution.
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
    }, 2000);
});