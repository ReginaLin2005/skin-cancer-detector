from flask import Flask, request, jsonify, render_template
import os
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)

# Load the model
model = tf.keras.models.load_model('skin-cancer-detector\my_flask_app\cancer_detection_model.h5')

# Define class names
class_names = ['benign', 'malignant']

def preprocess_image(image_path):
    img = Image.open(image_path)
    img = img.resize((224, 224))  # Adjust size based on your model's input shape
    img_array = np.array(img) / 255.0  # Normalize pixel values
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

@app.route('/')
def index():
        return render_template('index.html')

@app.route('/about')
def about():
        return render_template('about.html')

@app.route('/contact')
def contact():
        return render_template('contact.html')

@app.route('/prediction')
def predict():
        return render_template('prediction.html')

@app.route('/analysis')
def analyze():
      return render_template('analysis.html')

@app.route('/submit', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    
    if file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)
        
        # Preprocess the image
        preprocessed_image = preprocess_image(file_path)
        
        # Make prediction
        prediction = model.predict(preprocessed_image)
        predicted_class = class_names[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))
        
        return jsonify({
            'success': 'file uploaded and analyzed successfully',
            'prediction': predicted_class,
            'confidence': confidence
        })
    else:
        return jsonify({'error': 'File is not a valid image format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
