from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'no file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'no selected file'}), 400
    
    if file and file.filename.endswith('.jpg'):
        file.save(os.path.join('uploads', file.filename))
        return jsonify({'success': 'file uploaded successfully'})
    else:
        return jsonify({'error': 'File is not a JPEG'}), 400

if __name__ == '__main__':
    app.run(debug=True)