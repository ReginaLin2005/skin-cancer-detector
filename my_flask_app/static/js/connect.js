document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageUpload = document.getElementById('imageUpload');
    const analyzeButton = document.getElementById('analyzeButton');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const nextButton = document.getElementById('nextButton');
    const newAnalysisButton = document.getElementById('newAnalysisButton');
    const manualUpload = document.getElementById('manualUpload');
    const webcamUpload = document.getElementById('webcamUpload');
    const openCameraButton = document.getElementById('openCameraButton');
    const webcamVideo = document.getElementById('webcamVideo');
    const photoCanvas = document.getElementById('photoCanvas');
    const captureButton = document.getElementById('captureButton');
    const retakeButton = document.getElementById('retakeButton');
    const usePhotoButton = document.getElementById('usePhotoButton');
    const fileInputRadio = document.getElementById('fileInputRadio');
    const imageInputRadio = document.getElementById('imageInputRadio');

    let stream = null;
    let capturedImage = null;

    nextButton.addEventListener('click', () => {
        document.getElementById('step-instructions').style.display = 'none';
        document.getElementById('step-upload').style.display = 'block';
    });

    fileInputRadio.addEventListener('change', () => {
        if (fileInputRadio.checked) {
            manualUpload.style.display = 'block';
            webcamUpload.style.display = 'none';
            analyzeButton.disabled = true;
            fileNameDisplay.textContent = '';
        }
    });

    imageInputRadio.addEventListener('change', () => {
        if (imageInputRadio.checked) {
            manualUpload.style.display = 'none';
            webcamUpload.style.display = 'block';
            analyzeButton.disabled = true;
            fileNameDisplay.textContent = '';
        }
    });

    imageUpload.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            analyzeButton.disabled = false;
            fileNameDisplay.textContent = 'File: ' + event.target.files[0].name;
        } else {
            analyzeButton.disabled = true;
            fileNameDisplay.textContent = '';
        }
    });

    openCameraButton.addEventListener('click', () => {
        document.getElementById('step-upload').style.display = 'none';
        document.getElementById('step-camera').style.display = 'block';
        startCamera();
    });

    async function startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamVideo.srcObject = stream;
            await webcamVideo.play();
            captureButton.style.display = 'block';
            retakeButton.style.display = 'none';
            usePhotoButton.style.display = 'none';
            photoCanvas.style.display = 'none';
            webcamVideo.style.display = 'block';
        } catch (err) {
            console.error('Error accessing webcam:', err);
            alert('Unable to access the webcam. Please check your permissions and try again.');
        }
    }

    captureButton.addEventListener('click', () => {
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = webcamVideo.videoWidth;
        photoCanvas.height = webcamVideo.videoHeight;
        context.drawImage(webcamVideo, 0, 0, photoCanvas.width, photoCanvas.height);
        
        webcamVideo.style.display = 'none';
        photoCanvas.style.display = 'block';
        captureButton.style.display = 'none';
        retakeButton.style.display = 'block';
        usePhotoButton.style.display = 'block';

        // Stop the webcam stream
        stream.getTracks().forEach(track => track.stop());
        stream = null;

        // Convert canvas to blob
        photoCanvas.toBlob((blob) => {
            capturedImage = blob;
        }, 'image/jpeg', 0.95);
    });

    retakeButton.addEventListener('click', () => {
        startCamera();
    });

    usePhotoButton.addEventListener('click', () => {
        if (capturedImage) {
            const timestamp = new Date().getTime();
            const fileName = `webcam-image-${timestamp}.jpg`;
            const file = new File([capturedImage], fileName, { type: 'image/jpeg' });

            // Create a new FileList containing only this file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // Set the files property of the file input
            imageUpload.files = dataTransfer.files;

            // Update UI
            document.getElementById('step-camera').style.display = 'none';
            document.getElementById('step-upload').style.display = 'block';
            fileInputRadio.checked = true;
            manualUpload.style.display = 'block';
            webcamUpload.style.display = 'none';
            analyzeButton.disabled = false;
            fileNameDisplay.textContent = `File: ${fileName}`;

            // Trigger the analyze button click
            analyzeButton.click();

            // Clear the capturedImage to ensure a new capture for the next time
            capturedImage = null;
        }
    });

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData();
        
        if (imageUpload.files.length > 0) {
            formData.append('imageUpload', imageUpload.files[0]);
        } else {
            alert('Please select an image or capture one using the webcam.');
            return;
        }
        
        try {
            // Hide upload step and show loading step
            document.getElementById('step-upload').style.display = 'none';
            document.getElementById('step-loading').style.display = 'block';

            // Simulate a delay for the analysis (remove this in production)
            await new Promise(resolve => setTimeout(resolve, 3000));

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            // Hide loading step and show results
            document.getElementById('step-loading').style.display = 'none';
            document.getElementById('step-results').style.display = 'block';
            document.getElementById('result').innerHTML = `
                <h4>Analysis Results:</h4>
                <p><strong>Prediction:</strong> ${result.prediction}</p>
                <p><strong>Confidence:</strong> ${result.confidence.toFixed(2)}%</p>
                <button id="downloadPdfButton" class="cta-button">Download PDF Report</button>
            `;

            // Add event listener for PDF download
            document.getElementById('downloadPdfButton').addEventListener('click', () => {
                generatePDF(result, imageUpload.files[0]);
            });
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('step-loading').style.display = 'none';
            document.getElementById('step-results').style.display = 'block';
            document.getElementById('result').innerHTML = 'An error occurred during analysis. Please try again.';
        }
    });

    newAnalysisButton.addEventListener('click', () => {
        window.location.reload();
    });
});

function generatePDF(result, imageFile) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Set font styles
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);

    // Add title
    doc.text("Skin Cancer Analysis Results", pageWidth / 2, 20, { align: "center" });

    // Add date
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Date: ${currentDate}`, 20, 30);

    // Add image
    const reader = new FileReader();
    reader.onload = function(event) {
        const imgData = event.target.result;
        doc.addImage(imgData, 'JPEG', 20, 40, 170, 100);

        // Add results
        doc.setFontSize(14);
        doc.text("Analysis Results:", 20, 150);
        doc.setFontSize(12);
        doc.text(`Prediction: ${result.prediction}`, 30, 160);
        doc.text(`Confidence: ${result.confidence.toFixed(2)}%`, 30, 170);

        // Add description
        doc.setFontSize(12);
        let description;
        if (result.prediction === "Positive") {
            description = "Our prediction model indicates that there is a possibility you may have skin cancer. " +
                "This analysis is based on the image you provided and our machine learning algorithm. " +
                "It's important to understand that this result suggests an increased likelihood of skin cancer, " +
                "but it is not a definitive diagnosis. Skin cancer can manifest in various forms, including melanoma, " +
                "basal cell carcinoma, and squamous cell carcinoma. Each type has different characteristics and potential risks. " +
                "Early detection and treatment of skin cancer significantly improve outcomes, which is why it's crucial to follow up " +
                "on these results with a healthcare professional.\n\n" +
                "Please note that various factors can influence the appearance of skin lesions, and not all suspicious-looking " +
                "spots are cancerous. Factors such as lighting conditions, image quality, and the specific characteristics of your " +
                "skin can affect the analysis. Therefore, it is essential to have a thorough in-person examination by a dermatologist " +
                "or qualified healthcare provider who can perform a detailed assessment and, if necessary, conduct a biopsy for a definitive diagnosis.";
        } else {
            description = "Based on our prediction model, the analyzed image does not show strong indicators of skin cancer. " +
                "While this result is encouraging, it's important to understand that this analysis is not a guarantee of absence of skin cancer. " +
                "Our model has limitations and cannot replace a professional medical examination. Skin cancer can sometimes be difficult to detect, " +
                "especially in its early stages or in certain forms.\n\n" +
                "It's always a good practice to monitor your skin for any changes over time. Be aware of the ABCDE rule for skin changes: " +
                "Asymmetry, Border irregularity, Color changes, Diameter increases, and Evolving shape or size. If you notice any of these changes, " +
                "or if you have any concerns about your skin health, it's advisable to consult with a dermatologist. Regular skin check-ups are " +
                "recommended, especially if you have risk factors such as fair skin, history of sunburns, or a family history of skin cancer.\n\n" +
                "Remember, early detection is key in successfully treating skin cancer, so staying vigilant about your skin health is important.";
        }
        const splitDescription = doc.splitTextToSize(description, pageWidth - 40);
        doc.text(splitDescription, 20, 190);

        // Add additional steps
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Recommended Next Steps:", 20, 20);
        doc.setFontSize(12);
        doc.text("1. Schedule an appointment with a dermatologist for a professional evaluation", 30, 30);
        doc.text("2. Bring this report and the original image to your appointment", 30, 40);
        doc.text("3. Discuss your concerns and this analysis result with your healthcare provider", 30, 50);
        doc.text("4. Follow your doctor's recommendations for any further testing or treatment", 30, 60);
        doc.text("5. Continue to monitor your skin for any changes and practice sun safety", 30, 70);

        // Add disclaimer
        doc.setFontSize(10);
        const disclaimer = "Disclaimer: This analysis is based on a machine learning model and is not a substitute for professional medical advice, diagnosis, or treatment. The results of this analysis should be used for informational purposes only. The accuracy of the prediction can vary, and false positives or false negatives can occur. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this report.";
        const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
        doc.text(splitDisclaimer, 20, pageHeight - 40, { align: "left" });

        // Save the PDF
        doc.save("skin-cancer-analysis-results.pdf");
    };
    reader.readAsDataURL(imageFile);
}