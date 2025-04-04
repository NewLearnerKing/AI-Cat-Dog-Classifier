document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewImage = document.getElementById('preview-image');
    const resultContainer = document.getElementById('result-container');
    const loadingElement = document.getElementById('loading');
    const resetButton = document.getElementById('reset-button');
    const catProgress = document.getElementById('cat-progress');
    const dogProgress = document.getElementById('dog-progress');
    const catProbability = document.getElementById('cat-probability');
    const dogProbability = document.getElementById('dog-probability');
    const prediction = document.getElementById('prediction');
    const breedInfo = document.getElementById('breed-info');
    const breedName = document.getElementById('breed-name');
    
    let model = null;
    let isModelLoading = false;
    
    // List of cat-related classes in MobileNet
    const catClasses = [
        'tabby', 'tiger_cat', 'persian_cat', 'siamese_cat', 'egyptian_cat',
        'cougar', 'lynx', 'leopard', 'snow_leopard', 'jaguar', 'lion', 'tiger', 'cheetah',
        'cat'
    ];
    
    // List of dog-related classes in MobileNet
    const dogClasses = [
        'chihuahua', 'japanese_spaniel', 'maltese_dog', 'pekinese', 'shih-tzu',
        'blenheim_spaniel', 'papillon', 'toy_terrier', 'rhodesian_ridgeback',
        'afghan_hound', 'basset', 'beagle', 'bloodhound', 'bluetick',
        'black-and-tan_coonhound', 'walker_hound', 'english_foxhound',
        'redbone', 'borzoi', 'irish_wolfhound', 'italian_greyhound',
        'whippet', 'ibizan_hound', 'norwegian_elkhound', 'otterhound',
        'saluki', 'scottish_deerhound', 'weimaraner', 'staffordshire_bullterrier',
        'american_staffordshire_terrier', 'bedlington_terrier', 'border_terrier',
        'kerry_blue_terrier', 'irish_terrier', 'norfolk_terrier', 'norwich_terrier',
        'yorkshire_terrier', 'wire-haired_fox_terrier', 'lakeland_terrier',
        'sealyham_terrier', 'airedale', 'cairn', 'australian_terrier',
        'dandie_dinmont', 'boston_bull', 'miniature_schnauzer', 'giant_schnauzer',
        'standard_schnauzer', 'scotch_terrier', 'tibetan_terrier', 'silky_terrier',
        'soft-coated_wheaten_terrier', 'west_highland_white_terrier',
        'lhasa', 'flat-coated_retriever', 'curly-coated_retriever', 'golden_retriever',
        'labrador_retriever', 'chesapeake_bay_retriever', 'german_short-haired_pointer',
        'vizsla', 'english_setter', 'irish_setter', 'gordon_setter', 'brittany_spaniel',
        'clumber', 'english_springer', 'welsh_springer_spaniel', 'cocker_spaniel',
        'sussex_spaniel', 'irish_water_spaniel', 'kuvasz', 'schipperke',
        'groenendael', 'malinois', 'briard', 'kelpie', 'komondor', 'old_english_sheepdog',
        'shetland_sheepdog', 'collie', 'border_collie', 'bouvier_des_flandres',
        'rottweiler', 'german_shepherd', 'doberman', 'miniature_pinscher',
        'greater_swiss_mountain_dog', 'bernese_mountain_dog', 'appenzeller',
        'entlebucher', 'boxer', 'bull_mastiff', 'tibetan_mastiff', 'french_bulldog',
        'great_dane', 'saint_bernard', 'eskimo_dog', 'malamute', 'siberian_husky',
        'affenpinscher', 'basenji', 'pug', 'leonberg', 'newfoundland',
        'great_pyrenees', 'samoyed', 'pomeranian', 'chow', 'keeshond',
        'brabancon_griffon', 'pembroke', 'cardigan', 'toy_poodle', 'miniature_poodle',
        'standard_poodle', 'mexican_hairless', 'dingo', 'dhole', 'african_hunting_dog',
        'dog', 'poodle', 'canine'
    ];
    
    // Load MobileNet model
    async function loadModel() {
        if (isModelLoading) return;
        
        try {
            isModelLoading = true;
            console.log('Loading MobileNet model...');
            
            // Load MobileNet with a lower version number for better compatibility
            model = await mobilenet.load({version: 2, alpha: 1.0});
            
            console.log('Model loaded successfully');
            isModelLoading = false;
        } catch (error) {
            console.error('Failed to load model:', error);
            alert('Error loading the AI model. Please check your internet connection and refresh the page.');
            isModelLoading = false;
        }
    }
    
    // Initialize the model when the page loads
    loadModel();
    
    // COMPLETELY FIXED EVENT HANDLING SYSTEM
    // ======================================
    
    // Make sure fileInput doesn't get triggered multiple times
    let isProcessingFile = false;
    
    // Clear all existing event listeners from dropArea by cloning and replacing the element
    const newDropArea = dropArea.cloneNode(true);
    dropArea.parentNode.replaceChild(newDropArea, dropArea);
    
    // Update references to the new elements
    const newUploadButton = newDropArea.querySelector('.upload-button');
    const newFileInput = document.getElementById('file-input');
    
    // Set up the drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        newDropArea.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // Handle highlighting the drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        newDropArea.addEventListener(eventName, function() {
            newDropArea.classList.add('dragging');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        newDropArea.addEventListener(eventName, function() {
            newDropArea.classList.remove('dragging');
        }, false);
    });
    
    // Handle file drop
    newDropArea.addEventListener('drop', function(e) {
        if (isProcessingFile) return;
        isProcessingFile = true;
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
        
        setTimeout(() => { isProcessingFile = false; }, 500);
    }, false);
    
    // Handle file selection via button click - completely separated from drop area
    newUploadButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        newFileInput.click();
    }, false);
    
    // Handle file input change
    newFileInput.addEventListener('change', function(e) {
        e.stopPropagation();
        if (isProcessingFile) return;
        isProcessingFile = true;
        
        if (this.files.length > 0) {
            handleFiles(this.files);
        }
        
        setTimeout(() => { isProcessingFile = false; }, 500);
    }, false);
    
    // Process the selected file
    function handleFiles(files) {
        const file = files[0];
        
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPG, PNG, GIF).');
            isProcessingFile = false;
            return;
        }
        
        // Show loading indicator right away
        showLoading();
        
        const reader = new FileReader();
        
        reader.onerror = function() {
            alert('Error reading the file. Please try another image.');
            hideLoading();
            isProcessingFile = false;
        };
        
        reader.onload = function(e) {
            // Create a new image object to ensure the image is fully loaded
            const img = new Image();
            img.onload = function() {
                previewImage.src = img.src;
                previewImage.style.display = 'block';
                
                // Start classification
                classifyImage();
            };
            img.onerror = function() {
                hideLoading();
                alert('Error loading the image. Please try another image.');
                isProcessingFile = false;
            };
            img.src = e.target.result;
        };
        
        try {
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error processing the image. Please try another image.');
            hideLoading();
            isProcessingFile = false;
        }
    }
    
    // Classify the image using MobileNet and our cat/dog class lists
    async function classifyImage() {
        if (!model) {
            if (!isModelLoading) {
                try {
                    await loadModel();
                } catch (error) {
                    hideLoading();
                    alert('Model failed to load. Please refresh the page and try again.');
                    isProcessingFile = false;
                    return;
                }
            } else {
                // If model is still loading, wait and try again
                setTimeout(classifyImage, 1000);
                return;
            }
        }
        
        try {
            // Classify the image using MobileNet
            const predictions = await model.classify(previewImage, 10); // Get top 10 predictions
            console.log('Raw predictions:', predictions);
            
            // Calculate cat and dog scores based on MobileNet classes
            let catScore = 0;
            let dogScore = 0;
            let detectedBreed = "Unknown";
            let highestBreedConfidence = 0;
            
            predictions.forEach(prediction => {
                const className = prediction.className.toLowerCase();
                const probability = prediction.probability;
                
                // Check if the class is in our cat or dog lists
                if (catClasses.some(catClass => className.includes(catClass))) {
                    catScore += probability;
                    
                    // Check if this is a specific cat breed with higher confidence
                    const specificCatBreeds = ['tabby', 'tiger_cat', 'persian_cat', 'siamese_cat', 'egyptian_cat'];
                    specificCatBreeds.forEach(breed => {
                        if (className.includes(breed) && probability > highestBreedConfidence) {
                            highestBreedConfidence = probability;
                            // Format the breed name nicely
                            detectedBreed = breed.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                        }
                    });
                }
                
                if (dogClasses.some(dogClass => className.includes(dogClass))) {
                    dogScore += probability;
                    
                    // Only use actual dog breeds, not general terms like 'dog' or 'canine'
                    const generalDogTerms = ['dog', 'canine', 'poodle'];
                    if (!generalDogTerms.some(term => className === term) && probability > highestBreedConfidence) {
                        highestBreedConfidence = probability;
                        // Format the breed name nicely
                        detectedBreed = className.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    }
                }
            });
            
            console.log('Cat score:', catScore);
            console.log('Dog score:', dogScore);
            console.log('Detected breed:', detectedBreed, 'with confidence:', highestBreedConfidence);
            
            // Display results
            displayResults(catScore, dogScore, detectedBreed, highestBreedConfidence);
        } catch (error) {
            console.error('Error during classification:', error);
            hideLoading();
            alert('An error occurred during image classification. Please try again with a different image.');
            isProcessingFile = false;
        }
    }
    
    // Display the classification results
    function displayResults(catScore, dogScore, breed, breedConfidence) {
        // Normalize scores to ensure they sum to 1
        const total = catScore + dogScore;
        const normalizedCatScore = catScore / total;
        const normalizedDogScore = dogScore / total;
        
        // Format percentages
        const catPercentage = Math.round(normalizedCatScore * 100);
        const dogPercentage = Math.round(normalizedDogScore * 100);
        
        // Update progress bars
        catProgress.style.width = `${catPercentage}%`;
        dogProgress.style.width = `${dogPercentage}%`;
        
        // Update percentage text
        catProbability.textContent = `${catPercentage}%`;
        dogProbability.textContent = `${dogPercentage}%`;
        
        // Determine the final prediction
        const isCat = normalizedCatScore > normalizedDogScore;
        prediction.textContent = isCat 
            ? 'This looks like a cat! 🐱' 
            : 'This looks like a dog! 🐶';
        
        prediction.className = 'prediction';
        if (isCat) {
            prediction.classList.add('cat');
        } else {
            prediction.classList.add('dog');
        }
        
        // Display breed information
        if (breed !== 'Unknown' && breedConfidence > 0.2) {
            breedName.textContent = breed;
            breedInfo.style.display = 'block';
        } else {
            // If we don't have a confident breed prediction
            if ((isCat && catPercentage > 70) || (!isCat && dogPercentage > 70)) {
                breedName.textContent = 'Breed not identified with confidence';
            } else {
                breedName.textContent = 'Unknown';
            }
            breedInfo.style.display = 'block';
        }
        
        // Show results and hide loading
        hideLoading();
        resultContainer.style.display = 'block';
        isProcessingFile = false;
    }
    
    // Show loading indicator
    function showLoading() {
        loadingElement.style.display = 'flex';
        resultContainer.style.display = 'none';
    }
    
    // Hide loading indicator
    function hideLoading() {
        loadingElement.style.display = 'none';
    }
    
    // Reset button click handler
    resetButton.addEventListener('click', function() {
        // Clear the image preview
        previewImage.src = '';
        previewImage.style.display = 'none';
        
        // Reset file input
        newFileInput.value = '';
        
        // Hide results
        resultContainer.style.display = 'none';
    });
});
