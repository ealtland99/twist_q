let SC_DETECTED = false;

// Define global constant for page numbers
const PAGES = Object.freeze({
    START_PAGE: 0,
    WARNING_DETECTED_PAGE: 1,
    NO_WARNING_PAGE: 2,
    SCANNED_NO_SC_PAGE: 3,
    SCANNED_SC_DETECTED_PAGE: 4,
    THANKS_PAGE: 5,
    YOU_CAN_EDIT_PAGE: 6,
    ERROR_PAGE: 7,
    WRITE_MORE_PAGE: 8,
});

// This function waits for an element to be present before acting on it
// (like when you want to append to something, you need to ensure it's there first)
function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

function buildTwistApp(nextDataset, PROLIFIC_ID) {
    waitForElm(".twitterBoxName").then((elm) => {
        if (
            document.getElementsByClassName("twist-extension-root")[0] == null
        ) {
            const tweetContainer = document.querySelector(".twitterBoxName");
            const postBtnContainer =
                document.querySelector(".twitterPostButton");
            const breakPageContainer = document.querySelector(".breakPageBox");
            const mainPageContainer = document.querySelector(".mainBox");
            const processingMessage =
                document.getElementById("processing-message");

            // Create the elements and set their properties - all the HTML stuff
            const twistAppContainer = document.createElement("div");
            twistAppContainer.classList.add("twist-extension-root");

            const twistApp = document.createElement("div");
            twistApp.classList.add("TwistApp");

            // const twistAppHeader = document.createElement("div");
            // twistAppHeader.classList.add("TwistApp-header");
            // twistAppHeader.innerHTML = "<h1> TWIST: Trigger Warning Includer for Sensitive Topics </h1>";
            // twistApp.appendChild(twistAppHeader);

            const twistAppBody = document.createElement("div");
            twistAppBody.classList.add("TwistApp-body");

            const twistPageContainer = document.createElement("div");
            twistPageContainer.classList.add("twist-page-container");
            twistPageContainer.innerHTML =
                '<div class="twist-page active" id="page0"> \
                                                <p>Type your tweet in the text box...</p> \
                                            </div> \
                                            <div class="twist-page" id="page1"> \
                                                <p>Thank you for adding a warning!</p> \
                                            </div> \
                                            <div class="twist-page" id="page2"> \
                                                <p>Would you like me to scan to see if your content needs a trigger warning or content warning?</p> \
                                            </div> \
                                            <div class="twist-page" id="page3"> \
                                                <p>Thanks for scanning!  No sensitive content detected.  For future reference, here are some topics where it is recommended to add a warning: violence, sex, stigma, anything disturbing, offensive or crude language, risky behaviors, mental health, death, adult restrictive or NSFW content, crime, abuse, or sociopolitical.</p> \
                                            </div> \
                                            <div class="twist-page" id="page4"> \
                                                <p>Thanks for scanning!  Warning recommended due to a high likelihood of one of these sensitive topics being present: <span id="topTopics"></span></p> \
                                            </div> \
                                            <div class="twist-page" id="page5"> \
                                                <p>Thanks for using the TWIST app and making social media a safer place for sensitive users.  You can now edit/post your tweet.</p> \
                                            </div> \
                                            <div class="twist-page" id="page6"> \
                                                <p>You can now edit/post your tweet.</p> \
                                            </div> \
                                            <div class="twist-page" id="page7"> \
                                                <p>ERROR ERROR ERROR</p> \
                                            </div> \
                                            <div class="twist-page" id="page8"> \
                                                <p>Please write a longer tweet responding to the given prompt.</p> \
                                            </div>';
            twistAppBody.appendChild(twistPageContainer);

            // Appends the agree with TWIST app text and buttons
            const agreeRadioBtnContainer = document.createElement("div");
            agreeRadioBtnContainer.classList.add("agreeRadioBtnContainer");

            const agreeingText = document.createElement("p");
            agreeingText.classList.add("agreeingText");
            agreeingText.textContent = "Do you agree with the scan results?";
            agreeRadioBtnContainer.appendChild(agreeingText);

            // Create the first radio button
            const radioButton1 = document.createElement("input");
            radioButton1.type = "radio";
            radioButton1.name = "agreeDisagree"; // Add a name to group radio buttons
            radioButton1.value = "agree";
            radioButton1.id = "agreeRadio"; // Optional: Assign an id for easier manipulation

            // Create the label for the first radio button
            const label1 = document.createElement("label");
            label1.htmlFor = "agreeRadio"; // Associate label with input using id
            label1.appendChild(radioButton1);
            label1.appendChild(document.createTextNode("I agree"));
            agreeRadioBtnContainer.appendChild(label1);

            // Create the second radio button
            const radioButton2 = document.createElement("input");
            radioButton2.type = "radio";
            radioButton2.name = "agreeDisagree"; // Add a name to group radio buttons
            radioButton2.value = "disagree";
            radioButton2.id = "disagreeRadio"; // Optional: Assign an id for easier manipulation

            // Create the label for the second radio button
            const label2 = document.createElement("label");
            label2.htmlFor = "disagreeRadio"; // Associate label with input using id
            label2.style.marginLeft = "15px";
            label2.appendChild(radioButton2);
            label2.appendChild(document.createTextNode("I disagree"));
            agreeRadioBtnContainer.appendChild(label2);

            // Append the container to the page
            twistPageContainer.appendChild(agreeRadioBtnContainer);

            // Creates "Previous", "Next", and "Skip" buttons
            const prevBtn = document.createElement("button");
            prevBtn.classList.add("action_btn");
            prevBtn.textContent = "Back";
            prevBtn.id = "prevBtn";

            const nextBtn = document.createElement("button");
            nextBtn.classList.add("action_btn", "submit");
            nextBtn.textContent = "Next";
            nextBtn.id = "nextBtn";

            const skipBtn = document.createElement("button");
            skipBtn.classList.add("action_btn", "cancel");
            skipBtn.textContent = "Skip";
            skipBtn.id = "skipBtn";

            // Create copy to clipboard button
            const copyBtn = document.createElement("button");
            copyBtn.classList.add("action_btn");
            copyBtn.textContent = "Copy Warning to Clipboard";
            copyBtn.id = "copyBtn";

            // Create a re-scan tweet button
            const reScanBtn = document.createElement("button");
            reScanBtn.classList.add("action_btn", "submit");
            reScanBtn.textContent = "Re-Scan Tweet Text";
            reScanBtn.id = "reScanBtn";

            prevBtn.addEventListener("click", showPreviousPage);
            nextBtn.addEventListener("click", showNextPage);
            skipBtn.addEventListener("click", showSkipAheadPage);
            copyBtn.addEventListener("click", copyWarning);
            reScanBtn.addEventListener("click", reScanTweet);

            // Appends the pagination buttons to the twistAppBody
            const twistButtons = document.createElement("div");
            twistButtons.classList.add("twist-buttons");
            twistButtons.appendChild(prevBtn);
            twistButtons.appendChild(nextBtn);
            twistButtons.appendChild(skipBtn);
            twistButtons.appendChild(copyBtn);
            twistButtons.appendChild(reScanBtn);
            twistPageContainer.appendChild(twistButtons);

            // Sets up the functionality for multiple pages in the design
            const pages = twistAppBody.querySelectorAll(".twist-page");
            let currentPageIndex = PAGES.START_PAGE;
            let lastPageIndex = PAGES.START_PAGE;

            function showPage(index) {
                if (pages.length >= 1) {
                    pages.forEach((page, i) => {
                        if (i === index) {
                            page.classList.add("active");
                        } else {
                            page.classList.remove("active");
                        }
                    });

                    // Get all radio buttons in the group
                    const radioButtons = document.querySelectorAll(
                        'input[name="agreeDisagree"]'
                    );

                    lastPageIndex = currentPageIndex;
                    currentPageIndex = index;
                    switch (currentPageIndex) {
                        case PAGES.WARNING_DETECTED_PAGE:
                            postBtnContainer.style.display = "block";
                            prevBtn.style.display = "none";
                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            copyBtn.style.display = "none";
                            reScanBtn.style.display = "none";
                            agreeRadioBtnContainer.style.display = "none";
                            break;
                        case PAGES.NO_WARNING_PAGE:
                            postBtnContainer.style.display = "none";
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "block";
                            nextBtn.textContent = "Yes";

                            skipBtn.style.display = "block";
                            skipBtn.textContent = "No";

                            copyBtn.style.display = "none";
                            reScanBtn.style.display = "none";
                            agreeRadioBtnContainer.style.display = "none";
                            break;
                        case PAGES.SCANNED_NO_SC_PAGE:
                            postBtnContainer.style.display = "none";
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "none";
                            nextBtn.textContent = "Okay, Got It";

                            skipBtn.style.display = "none";
                            copyBtn.style.display = "none";
                            reScanBtn.style.display = "none";

                            agreeRadioBtnContainer.style.display = "block";

                            // Loop through each radio button and set checked property to false
                            radioButtons.forEach((radioButton) => {
                                radioButton.checked = false;
                            });
                            break;
                        case PAGES.SCANNED_SC_DETECTED_PAGE:
                            postBtnContainer.style.display = "none";
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "none";
                            nextBtn.textContent = "Okay, Got It";

                            skipBtn.style.display = "none";

                            copyBtn.style.display = "block";

                            reScanBtn.style.display = "none";

                            agreeRadioBtnContainer.style.display = "block";

                            // Loop through each radio button and set checked property to false
                            radioButtons.forEach((radioButton) => {
                                radioButton.checked = false;
                            });
                            break;
                        case PAGES.THANKS_PAGE:
                            postBtnContainer.style.display = "block";

                            if (
                                lastPageIndex === PAGES.SCANNED_SC_DETECTED_PAGE
                            ) {
                                prevBtn.style.display = "block";
                                prevBtn.textContent =
                                    "Back to Warning Examples";
                            } else if (
                                lastPageIndex === PAGES.SCANNED_NO_SC_PAGE
                            ) {
                                prevBtn.style.display = "none";
                            }

                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            copyBtn.style.display = "none";

                            reScanBtn.style.display = "block";

                            agreeRadioBtnContainer.style.display = "none";
                            break;
                        case PAGES.YOU_CAN_EDIT_PAGE:
                            postBtnContainer.style.display = "block";

                            prevBtn.style.display = "block";
                            prevBtn.textContent = "Back to Scan";

                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            copyBtn.style.display = "none";
                            reScanBtn.style.display = "none";
                            agreeRadioBtnContainer.style.display = "none";
                            break;
                        case PAGES.ERROR_PAGE:
                            postBtnContainer.style.display = "none";
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "block";
                            nextBtn.textContent = "Reset";

                            skipBtn.style.display = "none";
                            copyBtn.style.display = "none";
                            reScanBtn.style.display = "none";
                            agreeRadioBtnContainer.style.display = "none";
                            break;
                        default:
                            postBtnContainer.style.display = "block";
                            prevBtn.style.display = "none";
                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            copyBtn.style.display = "none";
                            reScanBtn.style.display = "none";
                            agreeRadioBtnContainer.style.display = "none";
                    }
                }
            }

            // Adds event listener to the post button click so TWIST app shows on page
            postBtnContainer.addEventListener("click", async function () {
                const promptContainer = document.getElementById("promptText");
                let currPrompt = promptContainer.textContent;
                currPrompt = currPrompt.split(": ")[1];

                let tweetText = document.getElementById("textInput").value;
                tweetText = tweetText.trim();

                const processingMessage =
                    document.getElementById("processing-message");

                // Counting the number of words in the tweet
                const wordCount = tweetText.split(/\s+/).length;

                // Check if the tweet is at least 5 words long
                if (wordCount < 6) {
                    showPage(PAGES.WRITE_MORE_PAGE);

                    processingMessage.style.display = "block";
                    await saveButtonPress(
                        PROLIFIC_ID,
                        currPrompt,
                        "Post Tweet Pressed - Too Short",
                        tweetText
                    );
                    processingMessage.style.display = "none";

                    return;
                }

                try {
                    // Check if this is the first time post is pressed
                    if (
                        currentPageIndex === PAGES.START_PAGE ||
                        currentPageIndex === PAGES.WRITE_MORE_PAGE
                    ) {
                        processingMessage.style.display = "block";
                        await saveButtonPress(
                            PROLIFIC_ID,
                            currPrompt,
                            "Post Tweet Pressed - First",
                            tweetText
                        );
                        processingMessage.style.display = "none";

                        twistAppContainer.style.display = "block";

                        // Simple check for whether warning is already present
                        if (
                            tweetText
                                .toLowerCase()
                                .includes("trigger warning") ||
                            tweetText.toLowerCase().startsWith("tw") ||
                            tweetText
                                .toLowerCase()
                                .includes("content warning") ||
                            tweetText.toLowerCase().startsWith("cw") ||
                            tweetText.toLowerCase().includes("nsfw")
                        ) {
                            showPage(PAGES.WARNING_DETECTED_PAGE);
                        } else {
                            showPage(PAGES.NO_WARNING_PAGE);
                        }
                    }
                    // Or the second or later time it's pressed
                    else if (
                        currentPageIndex === PAGES.WARNING_DETECTED_PAGE ||
                        currentPageIndex === PAGES.THANKS_PAGE ||
                        currentPageIndex === PAGES.YOU_CAN_EDIT_PAGE ||
                        currentPageIndex === PAGES.ERROR_PAGE
                    ) {
                        let userScanned =
                            currentPageIndex === PAGES.THANKS_PAGE;

                        let eventStr = "Post Tweet Pressed";
                        if (currentPageIndex === PAGES.WARNING_DETECTED_PAGE) {
                            eventStr =
                                "Post Tweet Pressed - Warning Already Present";
                        }

                        processingMessage.style.display = "block";
                        await saveButtonPress(
                            PROLIFIC_ID,
                            currPrompt,
                            eventStr,
                            tweetText,
                            userScanned
                        );
                        processingMessage.style.display = "none";

                        // Clear everything before next prompt
                        showPage(PAGES.START_PAGE);
                        SC_DETECTED = false;
                        document.getElementById("textInput").value = "";
                        document.getElementById("response").innerText = "";

                        // Get all radio buttons in the group
                        const radioButtons = document.querySelectorAll(
                            'input[name="agreeDisagree"]'
                        );

                        // Loop through each radio button and set checked property to false
                        radioButtons.forEach((radioButton) => {
                            radioButton.checked = false;
                        });

                        const newPrompt = getNextPrompt();
                        if (newPrompt === "") {
                            let link = "";
                            switch (nextDataset) {
                                case "1":
                                    link =
                                        "https://virginiatech.questionpro.com/t/AWDvFZ11Q7?custom1=";
                                    break;
                                case 1:
                                    link =
                                        "https://virginiatech.questionpro.com/t/AWDvFZ11Q7?custom1=";
                                    break;
                                case "2":
                                    link =
                                        "https://virginiatech.questionpro.com/t/AWDvFZ11Rm?custom1=";
                                    break;
                                case 2:
                                    link =
                                        "https://virginiatech.questionpro.com/t/AWDvFZ11Rm?custom1=";
                                    break;
                                case "3":
                                    link =
                                        "https://virginiatech.questionpro.com/t/AWDvFZ11Ry?custom1=";
                                    break;
                                case 3:
                                    link =
                                        "https://virginiatech.questionpro.com/t/AWDvFZ11Ry?custom1=";
                                    break;
                                default:
                                    console.log(
                                        "ERROR WITH NEXT DATASET VALUE!"
                                    );
                                    break;
                            }
                            link = link + PROLIFIC_ID;
                            promptContainer.innerHTML =
                                "Thank you for completing part B of the study.  Please continue to part C by pressing the link below. <br><br><br>" +
                                "<a href='" +
                                link +
                                "' target='_blank'>" +
                                link +
                                "</a>";
                            tweetContainer.style.display = "none";
                        } else {
                            // Function to extract the number before the prompt
                            function extractPromptNumber(prompt) {
                                // Split the prompt string by ':'
                                const parts = prompt.split(":");
                                // Extract the number part and remove any leading/trailing spaces
                                const numberAsString = parts[0].trim();
                                // Convert the string number to an integer and subtract 1
                                const number = parseInt(numberAsString) - 1;
                                return number;
                            }

                            // Extract the prompt number
                            const promptNumber = extractPromptNumber(newPrompt);

                            // Update the prompt number element
                            const promptNumberElement =
                                document.getElementById("promptNumber");
                            if (promptNumberElement) {
                                promptNumberElement.textContent = promptNumber;
                            }

                            promptContainer.textContent = newPrompt;

                            breakPageContainer.style.display = "block";
                            breakPageContainer.style.opacity = "1";

                            promptContainer.style.display = "none";
                            promptContainer.style.opacity = "0";

                            tweetContainer.style.display = "none";
                            tweetContainer.style.opacity = "0";

                            mainPageContainer.style.border = "none";
                        }
                    }
                } catch (error) {
                    console.error("Error saving tweet:", error);
                    // Optionally, handle error
                }
            });

            async function showNextPage() {
                const promptContainer = document.getElementById("promptText");
                let currPrompt = promptContainer.textContent;
                currPrompt = currPrompt.split(": ")[1];

                let tweetText = document.getElementById("textInput").value;
                tweetText = tweetText.trim();

                // Get the label of the selected radio button
                const selectedRadioButton = document.querySelector(
                    'input[name="agreeDisagree"]:checked'
                );

                let nextPageIndex = PAGES.ERROR_PAGE;
                switch (currentPageIndex) {
                    case PAGES.NO_WARNING_PAGE:
                        try {
                            processingMessage.style.display = "block";
                            nextPageIndex = await sendTweetToOpenAI();
                            processingMessage.style.display = "none";
                        } catch (error) {
                            console.error(error);
                            nextPageIndex = PAGES.ERROR_PAGE;
                            return;
                        }

                        if (nextPageIndex === PAGES.SCANNED_SC_DETECTED_PAGE) {
                            SC_DETECTED = true;
                        } else {
                            SC_DETECTED = false;
                        }

                        saveButtonPress(
                            PROLIFIC_ID,
                            currPrompt,
                            "Yes to Scan Pressed",
                            tweetText
                        );

                        break;
                    case PAGES.SCANNED_NO_SC_PAGE:
                        if (selectedRadioButton) {
                            nextPageIndex = PAGES.THANKS_PAGE;
                        } else {
                            nextPageIndex = currentPageIndex;
                        }

                        saveButtonPress(
                            PROLIFIC_ID,
                            currPrompt,
                            "Okay Got It Pressed"
                        );
                        break;
                    case PAGES.SCANNED_SC_DETECTED_PAGE:
                        if (selectedRadioButton) {
                            nextPageIndex = PAGES.THANKS_PAGE;
                        } else {
                            nextPageIndex = currentPageIndex;
                        }

                        saveButtonPress(
                            PROLIFIC_ID,
                            currPrompt,
                            "Okay Got It Pressed"
                        );
                        break;
                    case PAGES.ERROR_PAGE:
                        // Clear everything except prompt and text to start again
                        SC_DETECTED = false;
                        document.getElementById("response").innerText = "";

                        // Get all radio buttons in the group
                        const radioButtons = document.querySelectorAll(
                            'input[name="agreeDisagree"]'
                        );

                        // Loop through each radio button and set checked property to false
                        radioButtons.forEach((radioButton) => {
                            radioButton.checked = false;
                        });

                        nextPageIndex = PAGES.START_PAGE;

                        saveButtonPress(
                            PROLIFIC_ID,
                            currPrompt,
                            "Reset Button Pressed"
                        );
                        break;
                }

                showPage(nextPageIndex);
            }

            function showPreviousPage() {
                const promptContainer = document.getElementById("promptText");
                let currPrompt = promptContainer.textContent;
                currPrompt = currPrompt.split(": ")[1];

                saveButtonPress(PROLIFIC_ID, currPrompt, "Back Button Pressed");

                showPage(lastPageIndex);
            }

            async function showSkipAheadPage() {
                const promptContainer = document.getElementById("promptText");
                let currPrompt = promptContainer.textContent;
                currPrompt = currPrompt.split(": ")[1];

                let scInt = PAGES.START_PAGE;
                try {
                    processingMessage.style.display = "block";
                    scInt = await sendTweetToOpenAI();
                    processingMessage.style.display = "none";
                } catch (error) {
                    console.error(error);
                    return;
                }

                if (scInt === PAGES.SCANNED_SC_DETECTED_PAGE) {
                    SC_DETECTED = true;
                } else {
                    SC_DETECTED = false;
                }

                saveButtonPress(PROLIFIC_ID, currPrompt, "No to Scan Pressed");

                showPage(PAGES.YOU_CAN_EDIT_PAGE);
            }

            function copyWarning() {
                const promptContainer = document.getElementById("promptText");
                let currPrompt = promptContainer.textContent;
                currPrompt = currPrompt.split(": ")[1];

                // Get the text content of the topTopics element
                var topTopicsText =
                    document.getElementById("topTopics").textContent;

                // Find the indices of the second and third single quotes
                var secondQuoteIndex = topTopicsText.indexOf(
                    "'",
                    topTopicsText.indexOf("'") + 1
                );
                var thirdQuoteIndex = topTopicsText.indexOf(
                    "'",
                    secondQuoteIndex + 1
                );

                // Extract the text between the second and third single quotes
                var warningText = topTopicsText.substring(
                    secondQuoteIndex + 1,
                    thirdQuoteIndex
                );

                saveButtonPress(
                    PROLIFIC_ID,
                    currPrompt,
                    "Copy to Clipboard Button Pressed",
                    undefined,
                    warningText
                );

                if (warningText != "") {
                    // Copy the extracted warning text to the clipboard
                    navigator.clipboard
                        .writeText(warningText)
                        .catch((error) => {
                            console.error(
                                "Error copying text to clipboard:",
                                error
                            );
                        });
                } else {
                    showPage(PAGES.ERROR_PAGE);

                    // If no text within single quotes is found, display an error message
                    throw new Error(
                        "Error: Unable to find warning text within single quotes!"
                    );
                }
            }

            async function reScanTweet() {
                const promptContainer = document.getElementById("promptText");
                let currPrompt = promptContainer.textContent;
                currPrompt = currPrompt.split(": ")[1];

                let tweetText = document.getElementById("textInput").value;
                tweetText = tweetText.trim();

                let nextPageIndex = PAGES.ERROR_PAGE;
                try {
                    processingMessage.style.display = "block";
                    nextPageIndex = await sendTweetToOpenAI();
                    processingMessage.style.display = "none";
                } catch (error) {
                    console.error(error);
                    nextPageIndex = PAGES.ERROR_PAGE;
                    return;
                }

                if (nextPageIndex === PAGES.SCANNED_SC_DETECTED_PAGE) {
                    SC_DETECTED = true;
                } else {
                    SC_DETECTED = false;
                }

                processingMessage.style.display = "block";
                await saveButtonPress(
                    PROLIFIC_ID,
                    currPrompt,
                    "ReScan Button Pressed",
                    tweetText
                );
                processingMessage.style.display = "none";

                showPage(nextPageIndex);
            }

            // Event listener for agree/disagree radio buttons
            agreeRadioBtnContainer.addEventListener("change", function () {
                nextBtn.style.display = "block";
            });

            showPage(currentPageIndex);

            // Builds the twistAppContainer with all its components
            twistApp.appendChild(twistAppBody);
            twistAppContainer.appendChild(twistApp);
            twistAppContainer.style.display = "block";

            // Append the TWIST app element to the end of parent container
            //tweetContainer.append(twistAppContainer);

            // Add the TWIST app element to the page before post button in parent container
            var referenceNode = document.getElementById("textInput");
            tweetContainer.insertBefore(
                twistAppContainer,
                referenceNode.nextSibling
            );

            //console.log("TWIST APP HAS BEEN CREATED AND ADDED TO PAGE");
        } else {
            //console.log("TWIST APP ALREADY EXISTS");
        }
    });
}

async function sendTweetToOpenAI() {
    const activePage = document.querySelector(".twist-page.active");
    const textInput = document.getElementById("textInput").value.trim();
    const responseElement = document.getElementById("response");
    const processingMessage = document.getElementById("processing-message");

    try {
        if (
            !activePage ||
            (activePage.id !== "page1" &&
                activePage.id !== "page2" &&
                activePage.id !== "page5")
        ) {
            throw new Error("Invalid page state");
        }

        processingMessage.style.display = "block";
        const apiPrompt = await createPrompt(textInput);
        processingMessage.style.display = "none";

        processingMessage.style.display = "block";
        const response = await fetch("/openai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: apiPrompt }),
        });
        processingMessage.style.display = "none";

        if (!response.ok) {
            throw new Error("Failed to communicate with OpenAI");
        }

        processingMessage.style.display = "block";
        const jsonResponse = await response.json();
        processingMessage.style.display = "none";
        const responseText = (responseElement.innerText =
            jsonResponse.response);

        if (responseText.startsWith("No")) {
            return PAGES.SCANNED_NO_SC_PAGE;
        } else if (responseText.startsWith("Yes")) {
            const topicsList = document.getElementById("topTopics");
            const index = responseText.indexOf("1");
            if (index !== -1) {
                topicsList.innerText = responseText.substring(index);
                return PAGES.SCANNED_SC_DETECTED_PAGE;
            } else {
                throw new Error("Invalid response from OpenAI");
            }
        } else {
            throw new Error("Invalid response from OpenAI");
        }
    } catch (error) {
        console.error("Error in sendTweetToOpenAI:", error.message);
        responseElement.innerText = "Error communicating with OpenAI";
        return PAGES.ERROR_PAGE;
    }
}

async function createPrompt(tweetText) {
    let prompt = "";
    let sensitiveTopicsFile = "";
    const processingMessage = document.getElementById("processing-message");

    try {
        // sensitive-topics.txt is formatted version of categories 1-12 from
        // Charles A, Hare-Duke L, Nudds H, Franklin D, Llewellyn-Beardsley J, et al. (2022)
        // Typology of content warnings and trigger warnings: Systematic review. PLOS ONE 17(5): e0266722. https://doi.org/10.1371/journal.pone.0266722
        processingMessage.style.display = "block";
        const response = await fetch("sensitive-topics.txt");
        processingMessage.style.display = "none";

        // Check if the request was successful (status code 200)
        if (!response.ok) {
            throw new Error("Failed to load the file");
        }

        // Get the response text
        processingMessage.style.display = "block";
        sensitiveTopicsFile = await response.text();
        processingMessage.style.display = "none";

        prompt =
            "Here is a list of 12 sensitive topics with a short definition and some sub-categories each:\n\n" +
            sensitiveTopicsFile +
            "\n\n Based on this sensitive topic list, does the following tweet contain any of those topics?\n\n" +
            tweetText +
            "\n\nPlease answer with only a 'no' or if the answer is 'yes', respond with a 'yes' and a ranking of the top 5 topics the tweet exhibits with 1 as the most likely and 5 as the fifth likely.  The formatting of the ranking should look like this: '1. Violence, 2. Death, 3. Sociopolitical, 4. Crime, 5. Stigma'" +
            "\nAfter this ranking, include 2-3 sample trigger or content warnings to complete this sentence and fill in the blank with ONLY 1-5 words: 'Here's what a trigger or content warning may look like: 'TW/CW: <blank>''";

        return prompt;
    } catch (error) {
        // Handle errors
        console.error(error);
        throw error; // Propagate the error further if needed
    }
}

function getTimestamp() {
    // Get the current timestamp in milliseconds
    const timestamp = Date.now();

    // Create a new Date object using the timestamp
    const date = new Date(timestamp);

    // Get the components of the date (year, month, day, hour, minute, second)
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Month starts from 0
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    // Create a human-readable date and time string
    const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${
        day < 10 ? "0" : ""
    }${day} ${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}:${
        second < 10 ? "0" : ""
    }${second}`;

    console.log(formattedDate); // Output: "2024-03-27 12:45:30"
    return formattedDate;
}

async function saveButtonPress(
    PROLIFIC_ID,
    prompt,
    eventStr,
    tweetText,
    copiedText
) {
    const processingMessage = document.getElementById("processing-message");

    try {
        let saveData = {
            timestamp: getTimestamp(),
            event: eventStr,
        };

        // Additional data based on eventStr
        switch (eventStr) {
            case "Start Button Pressed": // 1
                // Nothing else to save
                break;
            case "Post Tweet Pressed - Too Short": // 2
                saveData.tweetText = tweetText;
                break;
            case "Post Tweet Pressed - First": // 3
                saveData.tweetText = tweetText;
                break;
            case "Post Tweet Pressed": // 4
                saveData.tweetText = tweetText;
                break;
            case "Post Tweet Pressed - Warning Already Present": // 5
                saveData.tweetText = tweetText;
                break;
            case "Yes to Scan Pressed": // 6
                saveData.tweetText = tweetText;
                saveData.userScanned = true;
                saveData.scDetected = SC_DETECTED;
                saveData.openAIResponse =
                    document.getElementById("response").innerText;
                break;
            case "Okay Got It Pressed": // 7
                const selectedRadioButton = document.querySelector(
                    'input[name="agreeDisagree"]:checked'
                );
                if (selectedRadioButton) {
                    selectedLabel = document
                        .querySelector(
                            'label[for="' + selectedRadioButton.id + '"]'
                        )
                        .innerText.trim();
                } else {
                    selectedLabel = null;
                }
                saveData.radioAgreeDisagree = selectedLabel;
                break;
            case "Reset Button Pressed": // 8
                // Nothing else to save
                break;
            case "Back Button Pressed": // 9
                // Nothing else to save
                break;
            case "No to Scan Pressed": // 10
                saveData.tweetText = tweetText;
                saveData.userScanned = false;
                saveData.scDetected = SC_DETECTED;
                saveData.openAIResponse =
                    document.getElementById("response").innerText;
                break;
            case "Copy to Clipboard Button Pressed": // 11
                saveData.copiedText = copiedText;
                break;
            case "ReScan Button Pressed": // 12
                saveData.tweetText = tweetText;
                saveData.userScanned = true;
                saveData.scDetected = SC_DETECTED;
                saveData.openAIResponse =
                    document.getElementById("response").innerText;
                break;
            default:
                // Should never get here...
                break;
        }

        processingMessage.style.display = "block";
        const response = await fetch("/save-button-press", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prolificID: PROLIFIC_ID,
                prompt: prompt,
                saveArray: [saveData], // Save data as an array
            }),
        });
        processingMessage.style.display = "none";

        if (response.ok) {
            console.log("Data saved successfully.");
        } else {
            console.error("Failed to save data.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
