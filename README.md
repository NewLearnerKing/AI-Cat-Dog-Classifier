# Cat vs Dog AI Classifier

This is a web application that uses TensorFlow.js and a pre-trained MobileNet model to classify images as either cats or dogs. The application runs entirely in the browser with no backend requirements.

## Features

- Drag and drop or upload images to classify
- Real-time image classification
- Visual representation of classification probabilities
- Responsive design that works on both desktop and mobile devices

## How It Works

The application uses TensorFlow.js to load a pre-trained MobileNet model, which can identify 1000+ different objects. The model's predictions are then processed to determine if the image contains a cat or a dog by looking for relevant classes in the prediction results.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- TensorFlow.js
- MobileNet pre-trained model

## Usage

1. Open the `index.html` file in a web browser
2. Upload an image by dragging and dropping or clicking the upload button
3. Wait for the classification results
4. View the probability of the image being a cat or a dog
5. Click "Analyze Another Image" to try with a different image

## Limitations

- The MobileNet model was not specifically trained to distinguish between cats and dogs, so it may not be as accurate as a specialized model.
- The classification relies on the presence of certain keywords in the prediction classes.
- Some images may be difficult to classify correctly, especially if they contain other objects or if the animal is in an unusual pose or partially visible.
