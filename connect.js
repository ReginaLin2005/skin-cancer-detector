document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const imageUpload = document.getElementById('imageUpload');
    const analyzeButton = document.getElementById('analyzeButton');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const nextButton = document.getElementById('nextButton');
    const newAnalysisButton = document.getElementById('newAnalysisButton');

    nextButton.addEventListener('click', () => {
        document.getElementById('step-instructions').style.display = 'none';
        document.getElementById('step-upload').style.display = 'block';
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

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(uploadForm);
        
        try {
            document.getElementById('step-upload').style.display = 'none';
            document.getElementById('step-loading').style.display = 'block';

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            document.getElementById('step-loading').style.display = 'none';
            document.getElementById('step-results').style.display = 'block';
            document.getElementById('result').innerHTML = `
                <h4>Analysis Results:</h4>
                <p>Prediction: ${result.prediction}</p>
                <p>Confidence: ${result.confidence.toFixed(2)}%</p>
            `;
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

// Helper function to remove event listeners (if they exist)
function removeEventListener(element, eventType, handler) {
    if (element && element.removeEventListener) {
        element.removeEventListener(eventType, handler);
    }
}

// Placeholder functions for existing event handlers (to be removed)
function handleImageUpload() {}
function handleAnalyzeClick() {}
