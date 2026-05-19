const API_KEY = "AIzaSyArRw1ndC1tnt1Eiy8VK--Bnoierv7V47I";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const userInput = document.getElementById('userInput');
        const micBtn = document.getElementById('micBtn');
        const submitBtn = document.getElementById('submitBtn');
        const responseBox = document.getElementById('responseBox');
        const statusMessage = document.getElementById('statusMessage');

        // --- Speech Recognition Setup (Listening) ---
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition;

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                micBtn.classList.add('listening');
                statusMessage.textContent = "Listening...";
            };

            recognition.onend = () => {
                micBtn.classList.remove('listening');
                statusMessage.textContent = "Finished listening.";
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                statusMessage.textContent = "Voice captured! Ready to ask.";
            };

            recognition.onerror = (event) => {
                statusMessage.textContent = "Error capturing voice. Try typing.";
                micBtn.classList.remove('listening');
            };

            micBtn.addEventListener('click', () => {
                recognition.start();
            });
        } else {
            micBtn.style.display = 'none';
            statusMessage.textContent = "Voice input not supported in this browser.";
        }

        // --- Text to Speech Setup (Speaking) ---
        function speakText(text) {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech first
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            }
        }

        // --- Gemini API Call ---
        async function fetchAIResponse() {
            const prompt = userInput.value.trim();
            if (!prompt) {
                alert("Please enter a question or speak first!");
                return;
            }

            // UI Changes for Loading State
            submitBtn.disabled = true;
            submitBtn.textContent = "Thinking...";
            responseBox.textContent = "Waiting for OmniKnowAI...";
            statusMessage.textContent = "Contacting Gemini API...";

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }

                const data = await response.json();
                
                // Extracting text from Gemini's JSON structure
                const aiReply = data.candidates[0].content.parts[0].text;
                
                // Show text response
                responseBox.textContent = aiReply;
                statusMessage.textContent = "Done!";
                
                // Speak response out loud
                speakText(aiReply);

            } catch (error) {
                console.error(error);
                responseBox.textContent = "Error: Could not fetch data. Make sure your internet is working and the API key is active.";
                statusMessage.textContent = "Failed to fetch response.";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Ask Gemini";
            }
        }

        submitBtn.addEventListener('click', fetchAIResponse);
