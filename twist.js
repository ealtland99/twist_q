// This function waits for an element to be present before acting on it 
// (like when you want to append to something, you need to ensure it's there first)
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function buildTwistApp() {
    // These will be different on X vs quantitative study server so creating variables for them
    const twitterBoxName = ".twitterBoxName";
    const twitterPostButton = ".twitterPostButton";

    waitForElm(twitterBoxName).then((elm) => {
        if (document.getElementsByClassName("twist-extension-root")[0] == null) {
            const tweetContainer = document.querySelector(twitterBoxName);
            const postBtnContainer = document.querySelector(twitterPostButton);
            
            // Create the elements and set their properties - all the HTML stuff
            const twistAppContainer = document.createElement("div");
            twistAppContainer.classList.add("twist-extension-root");

            const twistApp = document.createElement("div");
            twistApp.classList.add("TwistApp");

            const twistAppHeader = document.createElement("div");
            twistAppHeader.classList.add("TwistApp-header");
            twistAppHeader.innerHTML = '<h1> \
                                            TWIST: Trigger Warning Includer for Sensitive Topics \
                                        </h1>';
            twistApp.appendChild(twistAppHeader);

            const twistAppBody = document.createElement("div");
            twistAppBody.classList.add("TwistApp-body");

            const twistPageContainer = document.createElement("div");
            twistPageContainer.classList.add("twist-page-container");
            twistPageContainer.innerHTML = '<div class="twist-page active" id="page0"> \
                                                <p>Type your tweet(s) below...</p> \
                                            </div> \
                                            <div class="twist-page" id="page1"> \
                                                <p>Warning detected.  Can I save this tweet and warning to learn more about the usage of trigger and content warnings?</p> \
                                            </div> \
                                            <div class="twist-page" id="page2"> \
                                                <p>No trigger or content warning detected.  Would you like me to scan to see if you need a warning?</p> \
                                            </div> \
                                            <div class="twist-page" id="page3"> \
                                                <p>Thanks for scanning!  No sensitive content detected.  For future reference, here are some topics where it is recommended to add a warning...</p> \
                                            </div> \
                                            <div class="twist-page" id="page4"> \
                                                <p>Thanks for scanning!  Warning recommended due to a high likelihood of one of these sensitive topics being present ____.  Heres what a trigger or content warning may look like...</p> \
                                            </div> \
                                            <div class="twist-page" id="page5"> \
                                                <p>Thanks for using the TWIST app and making social media a safer place for sensitive users.  You can now post your tweet(s).</p> \
                                            </div>\
                                            <div class="twist-page" id="page6"> \
                                                <p>You can now post your tweet(s).</p> \
                                            </div> \
                                            <div class="twist-page" id="page7"> \
                                                <p>ERROR ERROR ERROR</p> \
                                            </div>';
            twistAppBody.appendChild(twistPageContainer);
            
            // Creates "Previous", "Next", and "Skip" buttons
            const prevBtn = document.createElement('button');
            prevBtn.classList.add('action_btn');
            prevBtn.textContent = 'Back';
            prevBtn.id = 'prevBtn';

            const nextBtn = document.createElement('button');
            nextBtn.classList.add('action_btn', 'submit');
            nextBtn.textContent = 'Next';
            nextBtn.id = 'nextBtn';

            const skipBtn = document.createElement('button');
            skipBtn.classList.add('action_btn', 'cancel');
            skipBtn.textContent = 'Skip';
            skipBtn.id = 'skipBtn';

            prevBtn.addEventListener('click', showPreviousPage);
            nextBtn.addEventListener('click', showNextPage);
            skipBtn.addEventListener('click', showSkipAheadPage);

            // Appends the pagination buttons to the twistAppBody
            const twistButtons = document.createElement("div");
            twistButtons.classList.add("twist-buttons");
            twistButtons.appendChild(prevBtn);
            twistButtons.appendChild(nextBtn);
            twistButtons.appendChild(skipBtn);
            twistPageContainer.appendChild(twistButtons);

            // Adds event listener to the post button click so TWIST app shows on page
            postBtnContainer.addEventListener("click", function () {
                twistAppContainer.style.display = "block";

                // Look at text and print to console for now
                let tweetText = document.getElementById('textInput').value;
                
                // Simple check for whether warning is already present
                if (tweetText.toLowerCase().includes("trigger warning") || tweetText.toLowerCase().includes("content warning")) {
                    showPage(1);
                }
                else {
                    showPage(2);
                }
            });

            // Sets up the functionality for multiple pages in the design
            const pages = twistAppBody.querySelectorAll('.twist-page');
            let currentPageIndex = 0;
            let lastPageIndex = 0;

            function showPage(index) {
                console.log(index);
                if (pages.length >= 1) {
                    pages.forEach((page, i) => {
                        if (i === index) {
                            page.classList.add('active');
                        } else {
                            page.classList.remove('active');
                        }
                    });

                    lastPageIndex = currentPageIndex;
                    currentPageIndex = index;
                    switch (currentPageIndex) {
                        case 0:
                            postBtnContainer.disabled = false;
                            prevBtn.style.display = "none";
                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            break;
                        case 1:
                            postBtnContainer.disabled = true;
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "block";
                            nextBtn.textContent = "Yes";

                            skipBtn.style.display = "block";
                            skipBtn.textContent = "No";
                            break;
                        case 2:
                            postBtnContainer.disabled = true;
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "block";
                            nextBtn.textContent = "Yes";

                            skipBtn.style.display = "block";
                            skipBtn.textContent = "No";
                            break;
                        case 3:
                            postBtnContainer.disabled = true;
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "block";
                            nextBtn.textContent = "Got It";

                            skipBtn.style.display = "none";
                            break;
                        case 4:
                            postBtnContainer.disabled = true;
                            prevBtn.style.display = "none";

                            nextBtn.style.display = "block";
                            nextBtn.textContent = "Got It";

                            skipBtn.style.display = "none";
                            break;
                        case 5:
                            postBtnContainer.disabled = false;
                            prevBtn.style.display = "block";
                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            break;
                        case 6:
                            postBtnContainer.disabled = false;
                            prevBtn.style.display = "block";
                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                            break;
                        default:
                            postBtnContainer.disabled = false;
                            prevBtn.style.display = "none";
                            nextBtn.style.display = "none";
                            skipBtn.style.display = "none";
                        }
                }
            }

            async function showNextPage() {
                let nextPageIndex = 0;
                switch (currentPageIndex) {
                    case 1:
                        nextPageIndex = 5;
                        break;
                    case 2:
                        // Assuming sendToOpenAI returns a Promise
                        try {
                            nextPageIndex = await sendToOpenAI();
                        } catch (error) {
                            // Handle errors if necessary
                            console.error(error);
                            nextPageIndex = 7;
                            return;
                        }
                        break;
                    case 3:
                        nextPageIndex = 5;
                        break;
                    case 4:
                        nextPageIndex = 5;
                    }

                showPage(nextPageIndex);
            }

            function showPreviousPage() {
                showPage(lastPageIndex);
            }

            function showSkipAheadPage() {
                showPage(6);
            }

            showPage(currentPageIndex);

            // Creates a button to minimize/maximize the TWIST app
            function toggleTWIST() {
                if (twistPageContainer.style.display == "none") {
                    twistPageContainer.style.display = "block";
                    hideAppBtn.textContent = 'Minimize App';
                }
                else {
                    twistPageContainer.style.display = "none";
                    hideAppBtn.textContent = 'Maximize App';
                }
            }

            const hideAppBtn = document.createElement('button');
            hideAppBtn.classList.add('action_btn');
            hideAppBtn.textContent = 'Minimize App';
            hideAppBtn.id = 'hideAppBtn';

            hideAppBtn.addEventListener('click', toggleTWIST);
            twistAppBody.appendChild(hideAppBtn);

            // Builds the twistAppContainer with all its components
            twistApp.appendChild(twistAppBody);
            twistAppContainer.appendChild(twistApp);
            twistAppContainer.style.display = "block";

            // Append the elements to the target on Twitter page
            tweetContainer.insertBefore(twistAppContainer, tweetContainer.firstChild);

            //console.log("TWIST APP HAS BEEN CREATED AND ADDED TO PAGE");
        }
        else {
            //console.log("TWIST APP ALREADY EXISTS");
        }
    });
}

async function sendToOpenAI() {
    console.log("I'm in sendToOpenAI() function");

    try {
        const elm = await waitForElm(".twist-page");

        console.log("I'm after waitForElm");
        const activePage = document.querySelector(".twist-page.active");

        console.log("I'm before the if");
        if (activePage != null && activePage.id === "page2") {
            console.log("I'm inside the if");
            const textInput = document.getElementById('textInput').value;
            if (textInput.length > 3) {
                const responseElement = document.getElementById('response');
                let apiPrompt = "";

                try {
                    apiPrompt = await createPrompt(textInput);
                } catch (error) {
                    console.error("Error in inner try-catch 1:", error);
                    responseElement.innerText = 'Error communicating with OpenAI';
                    return 7;
                }

                try {
                    console.log("I'm inside the try");
                    const response = await fetch('http://localhost:3000/openai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text: apiPrompt }),
                    });

                    const jsonResponse = await response.json();
                    responseElement.innerText = jsonResponse.response;

                    if (responseElement.innerText == "No") {
                        return 3;
                    } 
                    else if (responseElement.innerText == "Yes") {
                        return 4;
                    }
                    else {
                        return 7;
                    }
                } catch (error) {
                    console.error("Error in inner try-catch 2:", error);
                    responseElement.innerText = 'Error communicating with OpenAI';
                    return 7;
                }
            }
            else {
                responseElement.innerText = 'Tweet was too short to communicate with OpenAI';
                return 3;
            }
        }
        console.log("I'm after the if");
    } catch (error) {
        console.error("Error in sendToOpenAI:", error);
        responseElement.innerText = 'Error communicating with OpenAI';
        return 7;
    }
}

async function createPrompt(tweetText) {
    let prompt = "";
    let sensitiveTopicsFile = "";

    try {
        // sensitive-topics.txt is formatted version of categories 1-12 from 
        // Charles A, Hare-Duke L, Nudds H, Franklin D, Llewellyn-Beardsley J, et al. (2022) 
        // Typology of content warnings and trigger warnings: Systematic review. PLOS ONE 17(5): e0266722. https://doi.org/10.1371/journal.pone.0266722
        const response = await fetch('sensitive-topics.txt');

        // Check if the request was successful (status code 200)
        if (!response.ok) {
            throw new Error('Failed to load the file');
        }

        // Get the response text
        sensitiveTopicsFile = await response.text();

        prompt = "Here is a list of 12 sensitive topics with a short definition and some sub-categories each:\n\n" + sensitiveTopicsFile + "\n\n Based on this sensitive topic list, does the following tweet contain any of those topics?  Please answer with 'yes' or 'no' or 'unsure' only.\n\n" + tweetText;

        return prompt;
    } catch (error) {
        // Handle errors
        console.error(error);
        throw error; // Propagate the error further if needed
    }
}