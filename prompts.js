let promptsArray = [];

function initializePrompts(dataset) {
    console.log("Dataset being used is " + dataset);
    const datasetPath = `prompts${dataset}.txt`;
    // Read the dataset file and set the prompt
    return fetch(datasetPath)
        .then((response) => response.text())
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
    if (currentIndex < promptsArray.length) {
        prompt = currentIndex + 1 + ": " + promptsArray[currentIndex];
        currentIndex++;
    }
    return prompt;
}
