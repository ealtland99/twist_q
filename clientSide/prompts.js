let promptsArray = [];

function initializePrompts(dataset) {
    console.log("Dataset being used is " + dataset);
    const datasetPath = `prompts${dataset}.txt`;
    // Read the dataset file and set the prompt
    return fetch(datasetPath)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error fetching prompts");
            }
            return response.text();
        })
        .then((data) => {
            promptsArray = data
                .split("\n")
                .filter((prompt) => prompt.trim() !== "");
            shufflePrompts();
            currentIndex = 0;
        })
        .catch((error) => console.error("Error fetching prompts:", error));
}

function shufflePrompts() {
    promptsArray.sort(() => Math.random() - 0.5); // Shuffle the array
}

let currentIndex = 0;

function getNextPrompt() {
    let prompt = "";
    let scNum = null;
    let scTopic = "";

    if (currentIndex < promptsArray.length) {
        const promptParts = promptsArray[currentIndex].split("-");

        if (promptParts.length >= 3) {
            // Extract scNum, scTopic, and prompt text
            scNum = parseInt(promptParts[0].trim()); // Extract the first integer
            scTopic = promptParts[1].trim(); // Extract the string between dashes
            prompt = `${promptParts.slice(2).join("-").trim()}`; // Extract the text after the second dash
        }

        currentIndex++;
    }

    return { index: currentIndex, scNum, scTopic, prompt };
}
