document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // Element Bindings
    // ----------------------------------------------------
    
    // Stages
    const uploadSection = document.getElementById("uploadSection");
    const workspaceSection = document.getElementById("workspaceSection");
    const downloadSection = document.getElementById("downloadSection");
    
    // Stage 1: Upload
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    
    // Stage 2: Workspace Preview
    const originalPreview = document.getElementById("originalPreview");
    const originalSizeBadge = document.getElementById("originalSizeBadge");
    const metaFilename = document.getElementById("metaFilename");
    const metaResolution = document.getElementById("metaResolution");
    
    // Stage 2: Workspace Controls
    const resizeForm = document.getElementById("resizeForm");
    const widthInput = document.getElementById("widthInput");
    const heightInput = document.getElementById("heightInput");
    const aspectRatioBtn = document.getElementById("aspectRatioBtn");
    const qualityInput = document.getElementById("qualityInput");
    const qualityVal = document.getElementById("qualityVal");
    const qualityGroup = document.getElementById("qualityGroup");
    const formatRadios = document.getElementsByName("format");
    const changeImageBtn = document.getElementById("changeImageBtn");
    
    // Stage 3: Download
    const successOrigStats = document.getElementById("successOrigStats");
    const successNewStats = document.getElementById("successNewStats");
    const downloadLink = document.getElementById("downloadLink");
    const startOverBtn = document.getElementById("startOverBtn");
    
    // Loading Overlay
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingText = document.getElementById("loadingText");
    
    // ----------------------------------------------------
    // Application State Variables
    // ----------------------------------------------------
    let selectedFile = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 1;
    let isAspectRatioLocked = true;
    let outputBlobUrl = null;

    // SVG Icons for Lock State
    const lockIconPath = "M12 15V17M17 11V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z";
    const unlockIconPath = "M12 15V17M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z";

    // ----------------------------------------------------
    // Helper Functions
    // ----------------------------------------------------
    
    // Format bytes to human readable format
    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }
    
    // Switch views between Stage 1, 2, and 3
    function switchStage(stage) {
        uploadSection.classList.remove("active");
        workspaceSection.classList.remove("active");
        downloadSection.classList.remove("active");
        
        if (stage === 1) {
            uploadSection.classList.add("active");
        } else if (stage === 2) {
            workspaceSection.classList.add("active");
        } else if (stage === 3) {
            downloadSection.classList.add("active");
        }
    }
    
    // Show / Hide loading screen
    function toggleLoading(show, message = "Processing image...") {
        loadingText.textContent = message;
        if (show) {
            loadingOverlay.classList.add("active");
        } else {
            loadingOverlay.classList.remove("active");
        }
    }
    
    // ----------------------------------------------------
    // Stage 1: Drag and Drop Handlers
    // ----------------------------------------------------
    
    // Drag events
    ["dragenter", "dragover"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        }, false);
    });

    // Drop file event
    dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Browse click trigger
    dropzone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (fileInput.files && fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    // Core File Loader
    function handleFile(file) {
        // Validate image type
        if (!file.type.startsWith("image/")) {
            alert("Unsupported file format! Please upload an image file (PNG, JPG, WEBP).");
            return;
        }

        selectedFile = file;
        toggleLoading(true, "Reading image properties...");
        
        // Generate preview
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Store original dimensions
                originalWidth = img.width;
                originalHeight = img.height;
                aspectRatio = originalWidth / originalHeight;
                
                // Update UI elements in workspace
                originalPreview.src = event.target.result;
                originalSizeBadge.textContent = formatBytes(file.size);
                metaFilename.textContent = file.name;
                metaResolution.textContent = `${originalWidth} × ${originalHeight} px`;
                
                // Populate default resize inputs
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                
                // Lock aspect ratio by default
                isAspectRatioLocked = true;
                aspectRatioBtn.classList.add("active");
                document.getElementById("lockPath").setAttribute("d", lockIconPath);
                
                // Switch view to Workspace
                toggleLoading(false);
                switchStage(2);
            };
            
            img.onerror = function() {
                toggleLoading(false);
                alert("Could not load image. File may be corrupted.");
            };
            
            img.src = event.target.result;
        };
        
        reader.onerror = function() {
            toggleLoading(false);
            alert("Error reading file.");
        };
        
        reader.readAsDataURL(file);
    }

    // ----------------------------------------------------
    // Stage 2: Workspace Interaction Handlers
    // ----------------------------------------------------

    // Toggle Aspect Ratio
    aspectRatioBtn.addEventListener("click", () => {
        isAspectRatioLocked = !isAspectRatioLocked;
        
        if (isAspectRatioLocked) {
            aspectRatioBtn.classList.add("active");
            document.getElementById("lockPath").setAttribute("d", lockIconPath);
            
            // Re-sync dimensions based on width
            if (widthInput.value) {
                heightInput.value = Math.round(widthInput.value / aspectRatio);
            }
        } else {
            aspectRatioBtn.classList.remove("active");
            document.getElementById("lockPath").setAttribute("d", unlockIconPath);
        }
    });

    // Real-time aspect ratio sync inputs
    widthInput.addEventListener("input", () => {
        if (isAspectRatioLocked && widthInput.value && aspectRatio) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
    });

    heightInput.addEventListener("input", () => {
        if (isAspectRatioLocked && heightInput.value && aspectRatio) {
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
    });

    // Format selection toggle: toggle quality slider block
    formatRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const format = e.target.value;
            if (format === "png") {
                qualityGroup.classList.add("disabled-group");
            } else {
                qualityGroup.classList.remove("disabled-group");
            }
        });
    });

    // Quality slider label output
    qualityInput.addEventListener("input", () => {
        qualityVal.textContent = qualityInput.value + "%";
    });

    // Reset workspace and return to upload stage
    changeImageBtn.addEventListener("click", () => {
        resetApp();
    });

    // Reset download and return to upload stage
    startOverBtn.addEventListener("click", () => {
        resetApp();
    });

    // Reset function
    function resetApp() {
        // Clear variables
        selectedFile = null;
        originalWidth = 0;
        originalHeight = 0;
        aspectRatio = 1;
        isAspectRatioLocked = true;
        
        if (outputBlobUrl) {
            URL.revokeObjectURL(outputBlobUrl);
            outputBlobUrl = null;
        }

        // Reset inputs
        fileInput.value = "";
        resizeForm.reset();
        originalPreview.src = "";
        
        // Re-enable quality slider group and defaults
        qualityGroup.classList.remove("disabled-group");
        qualityVal.textContent = "80%";
        
        // Return to Stage 1
        switchStage(1);
    }

    // ----------------------------------------------------
    // API Resize Request Handler
    // ----------------------------------------------------
    resizeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            alert("No file selected.");
            return;
        }
        
        const widthVal = widthInput.value;
        const heightVal = heightInput.value;
        const formatVal = document.querySelector('input[name="format"]:checked').value;
        const qualityVal = qualityInput.value;
        
        // Build FormData payload
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("width", widthVal);
        formData.append("height", heightVal);
        formData.append("format", formatVal);
        formData.append("quality", qualityVal);
        formData.append("maintainAspectRatio", isAspectRatioLocked ? "true" : "false");
        
        toggleLoading(true, "Resizing and optimizing image...");
        
        try {
            const endpoint = window.location.protocol === "file:" 
                ? "http://localhost:3000/api/resize" 
                : "/api/resize";

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Image resizing failed");
            }
            
            const imageBlob = await response.blob();
            
            // Create a blob URL for download
            if (outputBlobUrl) {
                URL.revokeObjectURL(outputBlobUrl);
            }
            outputBlobUrl = URL.createObjectURL(imageBlob);
            
            // Configure Download Button
            const extension = formatVal === "jpeg" ? "jpg" : formatVal;
            const origBaseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
            const newFilename = `sleekscale_${origBaseName}_${widthVal}x${heightVal}.${extension}`;
            
            downloadLink.href = outputBlobUrl;
            downloadLink.download = newFilename;
            
            // Set Success Card Stats summaries
            successOrigStats.textContent = `${originalWidth} × ${originalHeight} (${formatBytes(selectedFile.size)})`;
            successNewStats.textContent = `${widthVal} × ${heightVal} (${formatBytes(imageBlob.size)})`;
            
            toggleLoading(false);
            switchStage(3);
        } catch (error) {
            toggleLoading(false);
            console.error("Resizing error:", error);
            alert(`An error occurred: ${error.message}. Please try again.`);
        }
    });
});
