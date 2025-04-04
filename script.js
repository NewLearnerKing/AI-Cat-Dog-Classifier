document.addEventListener('DOMContentLoaded', function() {
    // Gemini API Key
    const GEMINI_API_KEY = "AIzaSyBem6vU5pWE_r9rEnhoZsjiiHdjfpkaL1E";
    
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
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    let model = null;
    let isModelLoading = false;
    let isProcessingFile = false;
    
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
    
    // FILE UPLOAD AND DRAG-DROP HANDLING
    // ======================================
    
    // Get reference to the upload button (which is actually a label in the HTML)
    const uploadButton = document.querySelector('label[for="file-input"]');
    
    // Set up the drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // Handle highlighting the drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, function() {
            dropArea.classList.add('dragging');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, function() {
            dropArea.classList.remove('dragging');
        }, false);
    });
    
    // Handle file drop
    dropArea.addEventListener('drop', function(e) {
        if (isProcessingFile) return;
        isProcessingFile = true;
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
        
        setTimeout(() => { isProcessingFile = false; }, 500);
    }, false);
    
    // Handle file selection via button click
    uploadButton.addEventListener('click', function(e) {
        // No need for explicit click handling, as the label will trigger the file input
        console.log('Upload button clicked');
    }, false);
    
    // Handle file input change
    fileInput.addEventListener('change', function(e) {
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
    
    // Function to generate breed information using Gemini AI
    async function generateBreedInfo(breed, animalType) {
        try {
            // Replace with your Gemini API key
            const GEMINI_API_KEY = "AIzaSyBem6vU5pWE_r9rEnhoZsjiiHdjfpkaL1E";
            
            // Skip API call if no API key is provided
            if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
                updateBreedInfo("breed-details", "<p class='text-amber-600 dark:text-amber-400'>To enable enhanced breed information, add your Gemini API key to the script.</p>");
                return;
            }
            
            // Show loading animation
            updateBreedInfo("breed-details", `
                <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
            `);
            
            // Generate basic information to display even if API fails
            let fallbackInfo = '';
            if (animalType === 'cat') {
                fallbackInfo = generateCatInfo(breed);
            } else {
                fallbackInfo = generateDogInfo(breed);
            }
            
            try {
                // Create a more detailed prompt about the breed
                const prompt = `
                Provide detailed and accurate information about the ${breed} ${animalType} breed in the following format:
                
                - Appearance and Physical Characteristics
                - Personality and Temperament
                - Care Requirements
                - History and Origin
                - Lifespan and Health Considerations
                - Interesting Facts
                
                Format each section with Markdown headings (##) and keep paragraphs concise but informative.
                Aim for about 300-400 words total. Use simple HTML styling and paragraph breaks.
                `;
                
                // Make API request to Gemini API
                const response = await callGeminiAPI(prompt, GEMINI_API_KEY);
                
                // Process and display the response
                if (response && response.candidates && response.candidates.length > 0 && 
                    response.candidates[0].content && response.candidates[0].content.parts && 
                    response.candidates[0].content.parts.length > 0) {
                    
                    const content = response.candidates[0].content.parts[0].text;
                    console.log('Content received:', content.substring(0, 100) + '...'); // Log first 100 chars
                    
                    if (content) {
                        // Convert markdown to HTML
                        const formattedContent = content
                            .replace(/## (.*)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-blue-600 dark:text-blue-400">$1</h3>')
                            .replace(/\n\n/g, '</p><p class="mb-3">')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        
                        updateBreedInfo("breed-details", `<p class="mb-3">${formattedContent}</p>`);
                        return;
                    }
                }
                // If we get here, there was a problem with the response format but no exception
                throw new Error("Unexpected response format from API");
            } catch (error) {
                console.error('Error with Gemini API:', error);
                // Fall back to local information
                updateBreedInfo("breed-details", fallbackInfo);
            }
        } catch (error) {
            console.error('Error in breed info function:', error);
            updateBreedInfo("breed-details", `<p>Error generating breed information. Using basic information instead.</p>
                <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p>We're experiencing issues with our detailed breed information service.</p>
                    <p>Here's some basic information about ${breed} ${animalType}s:</p>
                    <ul class="list-disc pl-5 mt-2 space-y-1">
                        <li>Known for their ${animalType === 'cat' ? 'agility and independence' : 'loyalty and companionship'}</li>
                        <li>Often recognized by ${getDistinctiveFeature(breed, animalType)}</li>
                        <li>Popular as ${animalType === 'cat' ? 'domestic pets worldwide' : 'family companions and working animals'}</li>
                    </ul>
                </div>`);
        }
    }
    
    // Generate basic cat information as fallback
    function generateCatInfo(breed) {
        let info = `<h3 class="text-lg font-bold mt-4 mb-2 text-blue-600 dark:text-blue-400">About ${breed} Cats</h3>`;
        
        if (breed.toLowerCase().includes('tabby')) {
            info += `<p class="mb-3">Tabby cats are known for their distinctive coat patterns rather than being a specific breed. The tabby pattern includes stripes, swirls, or spots, often with an "M" marking on the forehead.</p>
            <p class="mb-3">Tabbies can be found in many cat breeds and come in various colors including brown, orange, silver, and gray. They are typically playful, affectionate, and make excellent companions.</p>`;
        } else if (breed.toLowerCase().includes('siamese')) {
            info += `<p class="mb-3">Siamese cats are one of the most recognized breeds, known for their striking blue almond-shaped eyes and color-point coat pattern.</p>
            <p class="mb-3">They are highly intelligent, vocal, and form strong bonds with their owners. Siamese cats are active and playful throughout their lives and typically live 12-15 years.</p>`;
        } else {
            info += `<p class="mb-3">${breed} cats are fascinating felines with distinctive characteristics that make them special companions.</p>
            <p class="mb-3">Like most cats, they are likely independent but affectionate with family members, and require regular veterinary care, quality nutrition, and mental stimulation.</p>`;
        }
        
        return info;
    }
    
    // Generate basic dog information as fallback
    function generateDogInfo(breed) {
        let info = `<h3 class="text-lg font-bold mt-4 mb-2 text-blue-600 dark:text-blue-400">About ${breed} Dogs</h3>`;
        
        if (breed.toLowerCase().includes('labrador')) {
            info += `<p class="mb-3">Labrador Retrievers are consistently one of the most popular dog breeds worldwide. They are known for their friendly temperament, intelligence, and versatility.</p>
            <p class="mb-3">Labs are excellent family dogs, service animals, and working dogs. They typically have a lifespan of 10-12 years and come in yellow, black, and chocolate colors.</p>`;
        } else if (breed.toLowerCase().includes('poodle')) {
            info += `<p class="mb-3">Poodles are highly intelligent dogs known for their distinctive curly, hypoallergenic coat and elegant appearance.</p>
            <p class="mb-3">They come in three sizes: standard, miniature, and toy. Despite their refined appearance, poodles were originally bred as water retrievers and are athletic, versatile companions.</p>`;
        } else {
            info += `<p class="mb-3">${breed} dogs have their own unique traits and characteristics that make them beloved companions.</p>
            <p class="mb-3">Like all dogs, they require proper training, regular exercise, routine veterinary care, and lots of love and attention from their owners.</p>`;
        }
        
        return info;
    }
    
    // Helper function for basic breed descriptions
    function getDistinctiveFeature(breed, animalType) {
        const catFeatures = {
            'tabby': 'their distinctive stripe patterns',
            'siamese': 'their color points and blue eyes',
            'persian': 'their long fur and flat faces',
            'maine': 'their large size and tufted ears',
            'bengal': 'their spotted or marbled coat pattern',
            'default': 'their unique appearance and behaviors'
        };
        
        const dogFeatures = {
            'labrador': 'their friendly demeanor and water-resistant coat',
            'poodle': 'their curly, hypoallergenic fur',
            'german': 'their intelligence and working abilities',
            'bulldog': 'their distinctive wrinkled face',
            'retriever': 'their golden coat and friendly personality',
            'default': 'their distinctive breed characteristics'
        };
        
        const features = animalType === 'cat' ? catFeatures : dogFeatures;
        
        for (const key in features) {
            if (breed.toLowerCase().includes(key)) {
                return features[key];
            }
        }
        
        return features.default;
    }
    
    // Function to call Gemini API
    async function callGeminiAPI(prompt, apiKey) {
        try {
            // Try with gemini-pro model (current standard)
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800,
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API error:', errorData);
                throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
            }
            
            const data = await response.json();
            console.log('Gemini API response:', data); // Log full response for debugging
            return data;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
    
    // Function to update breed information in the UI
    function updateBreedInfo(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
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
            let animalType = ""; // Track whether it's a cat or dog for API calls
            
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
                            animalType = "cat";
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
                        animalType = "dog";
                    }
                }
            });
            
            console.log('Cat score:', catScore);
            console.log('Dog score:', dogScore);
            console.log('Detected breed:', detectedBreed, 'with confidence:', highestBreedConfidence);
            console.log('Animal type:', animalType);
            
            // Display results
            displayResults(catScore, dogScore, detectedBreed, highestBreedConfidence);
            
            // After successful classification, generate breed information
            if (detectedBreed && detectedBreed !== 'Unknown' && animalType) {
                // Show breed info section right away with loading animation
                breedInfo.style.display = 'block';
                
                // Generate and display breed information
                await generateBreedInfo(detectedBreed, animalType);
            }
        } catch (error) {
            console.error('Error during classification:', error);
            hideLoading();
            alert('An error occurred during image classification. Please try again with a different image.');
            isProcessingFile = false;
        }
    }
    
    // Show loading indicator
    function showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }
    
    // Hide loading indicator
    function hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    // Reset button click handler
    resetButton.addEventListener('click', function() {
        // Clear the image preview
        previewImage.src = '';
        previewImage.style.display = 'none';
        
        // Reset progress bars
        catProgress.style.width = '0%';
        dogProgress.style.width = '0%';
        
        // Hide results
        resultContainer.classList.add('hidden');
        
        // Hide breed info
        document.getElementById('breed-info').classList.add('hidden');
        
        // Hide metrics and map
        document.getElementById('breed-metrics').classList.add('hidden');
        document.getElementById('breed-map').classList.add('hidden');
    });
    
    // Breed trait metrics (used for chart visualization)
    const breedTraits = {
        // Cat breeds
        'tabby': {
            affection: 8,
            energy: 6,
            grooming: 5,
            intelligence: 7,
            vocality: 5,
            health: 8
        },
        'siamese': {
            affection: 9,
            energy: 8,
            grooming: 3,
            intelligence: 9,
            vocality: 10,
            health: 7
        },
        'persian': {
            affection: 7,
            energy: 3,
            grooming: 10,
            intelligence: 6,
            vocality: 3,
            health: 5
        },
        'maine_coon': {
            affection: 9,
            energy: 7,
            grooming: 7,
            intelligence: 8,
            vocality: 6,
            health: 7
        },
        'bengal': {
            affection: 6,
            energy: 10,
            grooming: 4,
            intelligence: 10,
            vocality: 8,
            health: 7
        },
        'ragdoll': {
            affection: 10,
            energy: 4,
            grooming: 6,
            intelligence: 7,
            vocality: 4,
            health: 6
        },
        
        // Dog breeds
        'labrador': {
            affection: 10,
            energy: 8,
            grooming: 5,
            intelligence: 9,
            trainability: 10,
            health: 7
        },
        'poodle': {
            affection: 8,
            energy: 7,
            grooming: 10,
            intelligence: 10,
            trainability: 9,
            health: 7
        },
        'german_shepherd': {
            affection: 7,
            energy: 9,
            grooming: 6,
            intelligence: 10,
            trainability: 10,
            health: 6
        },
        'bulldog': {
            affection: 8,
            energy: 3,
            grooming: 4,
            intelligence: 6,
            trainability: 5,
            health: 3
        },
        'golden_retriever': {
            affection: 10,
            energy: 7,
            grooming: 7,
            intelligence: 9,
            trainability: 10,
            health: 6
        },
        'beagle': {
            affection: 8,
            energy: 8,
            grooming: 4,
            intelligence: 7,
            trainability: 6,
            health: 7
        }
    };
    
    // Geographical locations where breeds are common (for map visualization)
    const breedLocations = {
        // Cat breeds
        'tabby': [
            {lat: 51.5074, lng: -0.1278, name: 'London, UK - Common pet cat variety'},
            {lat: 40.7128, lng: -74.0060, name: 'New York, USA - Popular domestic breed'},
            {lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan - Widely adopted companion'}
        ],
        'siamese': [
            {lat: 13.7563, lng: 100.5018, name: 'Bangkok, Thailand - Origin location'},
            {lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA - Popular in US households'},
            {lat: 48.8566, lng: 2.3522, name: 'Paris, France - Commonly bred in Europe'}
        ],
        'persian': [
            {lat: 35.6892, lng: 51.3890, name: 'Tehran, Iran - Historical origin'},
            {lat: 51.5074, lng: -0.1278, name: 'London, UK - Popular show cat'},
            {lat: 40.4168, lng: -3.7038, name: 'Madrid, Spain - Widespread in Southern Europe'}
        ],
        'egyptian': [
            {lat: 30.0444, lng: 31.2357, name: 'Cairo, Egypt - Ancient breed origin'},
            {lat: 40.7128, lng: -74.0060, name: 'New York, USA - Modern breeding programs'},
            {lat: 51.5074, lng: -0.1278, name: 'London, UK - Popular exotic breed'}
        ],
        'bengal': [
            {lat: 22.5726, lng: 88.3639, name: 'Kolkata, India - Named after Bengal region'},
            {lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA - Developed in 1980s'},
            {lat: 51.5074, lng: -0.1278, name: 'London, UK - Popular exotic breed'}
        ],
        
        // Dog breeds
        'labrador': [
            {lat: 47.5615, lng: -52.7126, name: 'Newfoundland, Canada - Original breeding location'},
            {lat: 51.5074, lng: -0.1278, name: 'London, UK - Kennel Club recognition'},
            {lat: 40.7128, lng: -74.0060, name: 'New York, USA - Most popular US breed'}
        ],
        'poodle': [
            {lat: 48.8566, lng: 2.3522, name: 'Paris, France - Refined as French water dog'},
            {lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany - Early origins as German dog'},
            {lat: 40.7128, lng: -74.0060, name: 'New York, USA - Popular show dog'}
        ],
        'german_shepherd': [
            {lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany - Original breeding location'},
            {lat: 38.9072, lng: -77.0369, name: 'Washington DC, USA - Popular police/military dog'},
            {lat: 55.7558, lng: 37.6173, name: 'Moscow, Russia - Working dog in cold climates'}
        ],
        'beagle': [
            {lat: 51.5074, lng: -0.1278, name: 'London, UK - Refined modern beagle'},
            {lat: 40.7128, lng: -74.0060, name: 'New York, USA - Popular family pet'},
            {lat: 43.6532, lng: -79.3832, name: 'Toronto, Canada - Popular in North America'}
        ],
        'chihuahua': [
            {lat: 28.6330, lng: -106.0691, name: 'Chihuahua, Mexico - Named origin place'},
            {lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA - Popular in Southwest US'},
            {lat: 19.4326, lng: -99.1332, name: 'Mexico City, Mexico - Ancient breed origins'}
        ]
    };
    
    // Function to display breed information on the dashboard
    function displayBreedDashboard(animalType, breed, breedConfidence) {
        // Update breed title
        document.getElementById('breed-title').textContent = `${breed} Information`;
        
        // Show breed info container
        document.getElementById('breed-info').classList.remove('hidden');
        
        // Show metrics container
        const metricsContainer = document.getElementById('breed-metrics');
        metricsContainer.classList.remove('hidden');
        
        // Show map container
        const mapContainer = document.getElementById('breed-map');
        mapContainer.classList.remove('hidden');
        
        // Show classification details
        const classificationDetails = document.getElementById('classification-details');
        classificationDetails.classList.remove('hidden');
        
        // Create or update metrics chart
        createBreedMetricsChart(animalType, breed);
        
        // Initialize the map with breed locations
        initializeBreedMap(breed);
        
        // Try to get more accurate breed locations from Gemini
        getBreedLocationsFromGemini(breed, animalType);
        
        // Update classification details section
        updateClassificationDetails(breed, animalType, breedConfidence);
    }
    
    // Function to get breed locations from Gemini and update the map
    async function getBreedLocationsFromGemini(breed, animalType) {
        const normalizedBreed = normalizeBreedName(breed);
        
        // Check if we already have predefined locations for this breed
        let hasLocations = false;
        for (const key in breedLocations) {
            if (normalizedBreed.includes(key) || key.includes(normalizedBreed)) {
                hasLocations = true;
                break;
            }
        }
        
        // If we don't have predefined locations, ask Gemini
        if (!hasLocations && breed !== 'Unknown') {
            try {
                // Use the same API key as for breed info
                const GEMINI_API_KEY = "AIzaSyBem6vU5pWE_r9rEnhoZsjiiHdjfpkaL1E";
                
                // Skip API call if no API key is provided
                if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
                    console.log("No API key for location data");
                    return;
                }
                
                // Create a prompt for getting location data
                const prompt = `
                Give me 3 regions or cities in the world where ${breed} ${animalType}s are commonly found, bred, or originated.
                Return the answer as a JSON array with each location having lat (latitude), lng (longitude), and name properties.
                Format example:
                [
                  {"lat": 51.5074, "lng": -0.1278, "name": "London, UK - Brief info"},
                  {"lat": 40.7128, "lng": -74.0060, "name": "New York, USA - Brief info"}
                ]
                Only return the JSON array, no additional text. Use precise coordinates.
                `;
                
                // Call Gemini API for location data
                const response = await callGeminiAPI(prompt, GEMINI_API_KEY);
                
                if (response && response.candidates && response.candidates.length > 0 && 
                    response.candidates[0].content && response.candidates[0].content.parts && 
                    response.candidates[0].content.parts.length > 0) {
                    
                    const content = response.candidates[0].content.parts[0].text;
                    
                    try {
                        // Parse the JSON response
                        const locationData = JSON.parse(content);
                        
                        if (Array.isArray(locationData) && locationData.length > 0) {
                            // Add to our locations object
                            breedLocations[normalizedBreed] = locationData;
                            
                            // Update the map with new locations
                            updateBreedMap(breed, locationData);
                            
                            // Log success
                            console.log("Retrieved breed locations from Gemini:", locationData);
                        }
                    } catch (parseError) {
                        console.error("Error parsing location data:", parseError);
                    }
                }
            } catch (error) {
                console.error("Error getting location data from Gemini:", error);
            }
        }
    }
    
    // Update the map with new locations
    function updateBreedMap(breed, locations) {
        // Only update if we have a map and new locations
        if (window.breedMap && locations && locations.length > 0) {
            // Clear existing markers
            window.breedMap.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    window.breedMap.removeLayer(layer);
                }
            });
            
            // Add new markers
            locations.forEach(location => {
                L.marker([location.lat, location.lng])
                    .addTo(window.breedMap)
                    .bindPopup(location.name)
                    .openPopup();
            });
            
            // Update description
            document.getElementById('map-description').textContent = 
                `Regions where ${breed}s are commonly found`;
            
            // Fit bounds to show all markers
            if (locations.length > 1) {
                const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
                window.breedMap.fitBounds(bounds);
            }
            
            // Force a resize after display
            window.breedMap.invalidateSize();
        }
    }
    
    // Update the classification details section
    function updateClassificationDetails(breed, animalType, confidence) {
        // Update top predictions section
        const topPredictions = document.getElementById('top-predictions');
        
        // Clear existing predictions
        topPredictions.innerHTML = '';
        
        // Add main prediction
        const mainPredDiv = document.createElement('div');
        mainPredDiv.className = 'flex items-center justify-between font-semibold';
        mainPredDiv.innerHTML = `
            <span class="text-gray-800 dark:text-gray-200">${breed} (${animalType})</span>
            <span class="text-blue-600 dark:text-blue-400">${Math.round(confidence * 100)}%</span>
        `;
        topPredictions.appendChild(mainPredDiv);
        
        // Add secondary predictions (simulated for demonstration)
        const secondaryPredictions = getSecondaryPredictions(breed, animalType);
        secondaryPredictions.forEach(pred => {
            const predDiv = document.createElement('div');
            predDiv.className = 'flex items-center justify-between';
            predDiv.innerHTML = `
                <span class="text-gray-700 dark:text-gray-300">${pred.name}</span>
                <span class="text-gray-500 dark:text-gray-400">${pred.confidence}%</span>
            `;
            topPredictions.appendChild(predDiv);
        });
        
        // Update confidence bar
        const overallConfidence = document.getElementById('overall-confidence');
        const confidenceBar = document.getElementById('confidence-bar');
        const confidenceValue = Math.round(confidence * 100);
        
        overallConfidence.textContent = `${confidenceValue}%`;
        confidenceBar.style.width = `${confidenceValue}%`;
        
        // Update key features
        const keyFeatures = document.getElementById('key-features');
        keyFeatures.innerHTML = '';
        
        const features = getKeyFeatures(breed, animalType);
        features.forEach(feature => {
            const li = document.createElement('li');
            li.className = 'mb-1';
            li.textContent = feature;
            keyFeatures.appendChild(li);
        });
    }
    
    // Get simulated secondary predictions for demonstration
    function getSecondaryPredictions(mainBreed, animalType) {
        const predictions = [];
        const relatedBreeds = {
            'tabby': ['Domestic Shorthair', 'Mackerel Tabby'],
            'siamese': ['Oriental Shorthair', 'Balinese'],
            'persian': ['Himalayan', 'Exotic Shorthair'],
            'labrador': ['Golden Retriever', 'Chesapeake Bay Retriever'],
            'poodle': ['Bichon Frise', 'Portuguese Water Dog'],
            'german_shepherd': ['Belgian Malinois', 'Dutch Shepherd']
        };
        
        // Find related breeds or use defaults
        let relatedList = [];
        const normalizedBreed = normalizeBreedName(mainBreed);
        
        for (const key in relatedBreeds) {
            if (normalizedBreed.includes(key) || key.includes(normalizedBreed)) {
                relatedList = relatedBreeds[key];
                break;
            }
        }
        
        // If no match, use defaults based on animal type
        if (relatedList.length === 0) {
            relatedList = animalType === 'cat' ? 
                ['Domestic Shorthair', 'Mixed Breed'] : 
                ['Mixed Breed', 'Retriever Mix'];
        }
        
        // Create prediction entries with decreasing confidence
        relatedList.forEach((breed, index) => {
            const confidence = Math.round((80 - (index * 30)) * Math.random());
            if (confidence > 5) {  // Only add if confidence is significant
                predictions.push({
                    name: breed,
                    confidence: confidence
                });
            }
        });
        
        return predictions;
    }
    
    // Get key features for a specific breed
    function getKeyFeatures(breed, animalType) {
        const features = [];
        const normalizedBreed = normalizeBreedName(breed);
        
        // Common features based on animal type
        if (animalType === 'cat') {
            features.push('Whisker patterns and ear shape');
            features.push('Eye color and shape');
            features.push('Fur texture and length');
        } else {
            features.push('Muzzle shape and ear position');
            features.push('Body proportions and size');
            features.push('Coat type and coloration');
        }
        
        // Add breed-specific features
        if (normalizedBreed.includes('tabby')) {
            features.push('Distinctive "M" marking on forehead');
            features.push('Striped or swirled coat pattern');
        } else if (normalizedBreed.includes('siamese')) {
            features.push('Color point markings on extremities');
            features.push('Striking blue almond-shaped eyes');
        } else if (normalizedBreed.includes('persian')) {
            features.push('Flat face and short muzzle');
            features.push('Long, dense coat');
        } else if (normalizedBreed.includes('labrador')) {
            features.push('Otter-like tail');
            features.push('Broad head with friendly expression');
        } else if (normalizedBreed.includes('poodle')) {
            features.push('Curly, low-shedding coat');
            features.push('Proportional build with square profile');
        } else if (normalizedBreed.includes('german')) {
            features.push('Strong, alert stance');
            features.push('Pointed ears and sloped back');
        }
        
        // If we don't have specific features, add generic ones
        if (features.length < 4) {
            if (animalType === 'cat') {
                features.push('Distinctive feline profile');
            } else {
                features.push('Characteristic canine traits');
            }
        }
        
        return features;
    }
    
    // Function to display the classification results
    function displayResults(catScore, dogScore, breed, breedConfidence) {
        // Hide loading indicator
        hideLoading();
        
        // Determine the animal type based on scores
        const animalType = catScore > dogScore ? 'cat' : 'dog';
        
        // Convert confidence scores to percentages
        const catPercentage = Math.round(catScore * 100);
        const dogPercentage = Math.round(dogScore * 100);
        
        // Update the progress bars
        catProgress.style.width = catPercentage + '%';
        dogProgress.style.width = dogPercentage + '%';
        
        // Update the probability text
        catProbability.textContent = catPercentage + '%';
        dogProbability.textContent = dogPercentage + '%';
        
        // Update the prediction text
        prediction.textContent = 'Prediction: ' + (animalType === 'cat' ? 'Cat' : 'Dog');
        
        // Update the breed text if available
        if (breed) {
            breedName.textContent = 'Breed: ' + breed + ' (' + Math.round(breedConfidence * 100) + '% confidence)';
            
            // Call breed info API if confidence is above threshold
            if (breedConfidence > 0.4) {
                // Show the breed info section
                document.getElementById('breed-info').classList.remove('hidden');
                
                // Get more information about the breed
                generateBreedInfo(breed, animalType);
                
                // Display breed dashboard with metrics and map
                displayBreedDashboard(animalType, breed, breedConfidence);
            } else {
                // Not confident enough about breed, show generic info
                updateBreedInfo("breed-details", `<p class="text-amber-600 dark:text-amber-400">The model isn't confident enough to determine the exact breed.</p>`);
                
                // Still show dashboard with generic data
                displayBreedDashboard(animalType, animalType === 'cat' ? 'Domestic Cat' : 'Domestic Dog', breedConfidence);
            }
        } else {
            breedName.textContent = 'Breed: Unknown';
        }
        
        // Show the results container
        resultContainer.classList.remove('hidden');
        
        // Set isProcessingFile to false allowing for new uploads
        isProcessingFile = false;
    }
    
    // Initialize the map showing geographical distribution
    function initializeBreedMap(breed) {
        const mapDiv = document.getElementById('map-container');
        const normalizedBreed = normalizeBreedName(breed);
        
        // Find locations for this breed
        let locations = [];
        
        // Try to match by substring if exact match fails
        if (!breedLocations[normalizedBreed]) {
            for (const key in breedLocations) {
                if (normalizedBreed.includes(key) || key.includes(normalizedBreed)) {
                    locations = breedLocations[key];
                    break;
                }
            }
        } else {
            locations = breedLocations[normalizedBreed];
        }
        
        // If no locations found, use default (worldwide)
        if (locations.length === 0) {
            locations = [
                {lat: 40.7128, lng: -74.0060, name: 'New York, USA - Common pet location'},
                {lat: 51.5074, lng: -0.1278, name: 'London, UK - Popular pet region'},
                {lat: 48.8566, lng: 2.3522, name: 'Paris, France - Widespread domestic animals'}
            ];
            
            // Update description to indicate generic locations
            document.getElementById('map-description').textContent = 
                `Common locations for domestic ${breed} (generic data)`;
        } else {
            // Update description with accurate information
            document.getElementById('map-description').textContent = 
                `Regions where ${breed}s are commonly found`;
        }
        
        // Check if map already exists, destroy if needed
        if (window.breedMap) {
            window.breedMap.remove();
        }
        
        // Initialize map
        window.breedMap = L.map(mapDiv).setView([locations[0].lat, locations[0].lng], 2);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.breedMap);
        
        // Add markers for each location
        locations.forEach(location => {
            L.marker([location.lat, location.lng])
                .addTo(window.breedMap)
                .bindPopup(location.name)
                .openPopup();
        });
        
        // Fit bounds to show all markers
        if (locations.length > 1) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
            window.breedMap.fitBounds(bounds);
        }
        
        // Fix map rendering issue by forcing a resize after display
        setTimeout(() => {
            window.breedMap.invalidateSize();
        }, 100);
    }
    
    // Helper function to normalize breed names for lookup
    function normalizeBreedName(breed) {
        return breed.toLowerCase()
            .replace(/[^\w\s]/gi, '')  // Remove special chars
            .replace(/\s+/g, '_');     // Replace spaces with underscores
    }
    
    // Create breed metrics chart using Chart.js
    function createBreedMetricsChart(animalType, breed) {
        // Normalize breed name for lookup
        const normalizedBreed = normalizeBreedName(breed);
        
        // Get traits data for the breed or use default
        let traitsData = {};
        
        // Try to match by substring if exact match fails
        if (!breedTraits[normalizedBreed]) {
            for (const key in breedTraits) {
                if (normalizedBreed.includes(key) || key.includes(normalizedBreed)) {
                    traitsData = breedTraits[key];
                    break;
                }
            }
        } else {
            traitsData = breedTraits[normalizedBreed];
        }
        
        // If still no match, use default traits based on animal type
        if (Object.keys(traitsData).length === 0) {
            traitsData = animalType === 'cat' ? breedTraits['tabby'] : breedTraits['labrador'];
        }
        
        // Set up chart data
        const labels = Object.keys(traitsData).map(trait => 
            trait.charAt(0).toUpperCase() + trait.slice(1)
        );
        
        const data = Object.values(traitsData);
        
        // Get canvas and destroy previous chart if it exists
        const ctx = document.getElementById('metricsChart').getContext('2d');
        if (window.breedChart) {
            window.breedChart.destroy();
        }
        
        // Create radar chart
        window.breedChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: `${breed} Traits (1-10 Scale)`,
                    data: data,
                    backgroundColor: animalType === 'cat' ? 
                        'rgba(54, 162, 235, 0.2)' : 'rgba(153, 102, 255, 0.2)',
                    borderColor: animalType === 'cat' ? 
                        'rgb(54, 162, 235)' : 'rgb(153, 102, 255)',
                    pointBackgroundColor: animalType === 'cat' ? 
                        'rgb(54, 162, 235)' : 'rgb(153, 102, 255)',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 10
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? 
                                'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
                        }
                    }
                }
            }
        });
    }
    
    // Dark mode toggle functionality
    darkModeToggle.addEventListener('click', function() {
        document.documentElement.classList.toggle('dark');
    });
});
