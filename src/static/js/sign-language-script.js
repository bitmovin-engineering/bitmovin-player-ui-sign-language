fetch('sign-language-avatar.html').then(response => response.text()).then(html => {
    document.getElementById('sign-language-content').innerHTML = html;
    const scripts = document.querySelectorAll('#sign-language-content script');
    scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
    });
    CWASA.init(initCfg);
}).catch(error => console.error('Error fetching sign-language-avatar.html:', error));

let isFullscreen = false;

player.on(bitmovin.player.PlayerEvent.ViewModeChanged, function(event) {
    const avatarContainer = document.querySelector('.container-avatar');
    if (avatarContainer) {
        isFullscreen = !isFullscreen;

        if (isFullscreen) {
            // console.log(isFullscreen);
            avatarContainer.style.position = 'fixed';
            avatarContainer.style.top = '63.3%';
            avatarContainer.style.left = '0%';
            avatarContainer.style.zIndex = '1000';
        } else {
            // console.log(isFullscreen);
            avatarContainer.style.position = 'absolute';
            avatarContainer.style.top = '50.6%';
            avatarContainer.style.left = '0%';
            avatarContainer.style.zIndex = '1000';
        }
    }
});


/* Adding the logic for playing the Subtitles */

function parseConversionData(text) {
    const lines = text.split('\n');
    const data = {};
    lines.forEach(line => {
        const [sigmlCode, hamnosysCode] = line.split(',').map(item => item.trim());
        if (sigmlCode && hamnosysCode) {
            data[hamnosysCode] = sigmlCode;
        }
    });
    return data;
}

function parseGlossData(text) {
    const lines = text.split('\n');
    const data = {};
    lines.forEach(line => {
        const [gloss, hamnosys] = line.split(',').map(item => item.trim());
        if (gloss && hamnosys) {
            data[gloss.toLowerCase()] = hamnosys; // Store gloss in lowercase for case-insensitive search
        }
    });
    return data;
}

function parseOtherWords(text) {
    const words = text.split('\n').map(word => word.trim());
    return new Set(words);
}

// Load the conversion data from hamNoSys-conversion.txt and database.csv when the page loads
fetch('static/media-conversion/hamNoSys-conversion.txt')
    .then(response => response.text())
    .then(text => {
        window.conversionData = parseConversionData(text);
    })
    .catch(error => {
        console.error('Error loading hamNoSys-conversion.txt:', error);
    });

fetch('static/media-conversion/database.csv')
    .then(response => response.text())
    .then(text => {
        window.glossData = parseGlossData(text);
    })
    .catch(error => {
        console.error('Error loading database.csv:', error);
    });

fetch('static/media-conversion/other_words.txt')
    .then(response => response.text())
    .then(text => {
        window.otherWords = parseOtherWords(text);
    })
    .catch(error => {
        console.error('Error loading other_words.txt:', error);
    });


// Step 1: Fetch and parse the subtitles file
fetch('static/subtitles/subtitles_gloss_time.txt')
    .then(response => response.text())
    .then(data => {
        // Parse the subtitle data into a usable format
        const subtitles = parseSubtitles(data);
        console.log('Subtitles parsed:', subtitles);

        // Start checking the video time against the subtitles
        checkVideoTime(subtitles);
    })
    .catch(error => console.error('Error fetching subtitles:', error));

// Function to parse the subtitle text
function parseSubtitles(data) {
    const lines = data.split('\n');
    const subtitles = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes(' --> ')) {
            const timeRange = line.split(' --> ');
            const startTime = parseTime(timeRange[0]);
            const endTime = parseTime(timeRange[1]);
            const text = lines[i + 1] ? lines[i + 1].trim() : "";

            if (!isNaN(startTime) && !isNaN(endTime)) {
                subtitles.push({
                    start: startTime,
                    end: endTime,
                    text
                });
                i++; // Skip the next line since it's part of the current subtitle
            }
        }
    }

    return subtitles;
}

function parseTime(timeString) {
    // Expecting format: "HH:MM:SS.mmm"
    const timeParts = timeString.split(':');
    if (timeParts.length !== 3) {
        console.error('Error parsing time: ' + timeString);
        return NaN;
    }

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const secondsParts = timeParts[2].split('.');
    if (secondsParts.length !== 2) {
        console.error('Error parsing time: ' + timeString);
        return NaN;
    }
    const seconds = parseInt(secondsParts[0], 10);
    const milliseconds = parseInt(secondsParts[1], 10);

    const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
    return timeInSeconds;
}

// Step 2: Function to continuously check the video time and display subtitles
function checkVideoTime(subtitles) {
    let lastDisplayedSubtitle = null;

    setInterval(() => {
        const currentTime = player.getCurrentTime();

        // Find the current subtitle based on time
        const currentSubtitle = subtitles.find(subtitle =>
            currentTime >= subtitle.start && currentTime <= subtitle.end
        );

        // If a new subtitle is found and it's different from the last displayed one
        if (currentSubtitle && currentSubtitle !== lastDisplayedSubtitle) {
            console.log('Current Subtitle:', currentSubtitle.text);
            lastDisplayedSubtitle = currentSubtitle;

            // Process the subtitle to convert it to SiGML
            processSubtitleToSigml(currentSubtitle.text)
                .then(sigmlOutput => {
                    console.log('SiGML files:', sigmlOutput);
                    playEachSigmlFile(sigmlOutput);
                })
                .catch(error => {
                    console.error('Error processing subtitle:', error);
                });
        }

        // If no subtitle is found (meaning time is outside any subtitle range)
        if (!currentSubtitle) {
            lastDisplayedSubtitle = null; // Reset to allow the next subtitle to be displayed
        }
    }, 500); // Check every 0.5 seconds for more responsiveness
}

function playEachSigmlFile(sigmlArray) {
    let currentIndex = 0;

    function playNextSigmlFile() {
        if (currentIndex < sigmlArray.length) {
            startPlayer(sigmlArray[currentIndex]);
            console.log('Playing SiGML file:', sigmlArray[currentIndex]);

            // Set a delay between playing each SiGML file
            // Adjust the delay as needed based on the average duration of each SiGML file
            setTimeout(() => {
                currentIndex++;
                playNextSigmlFile();
            }, 500); // 2-second delay; adjust this value as necessary
        } else {
            console.log('Finished playing all SiGML files.');
        }
    }

    playNextSigmlFile(); // Start playing the first SiGML file
}


function processSubtitleToSigml(subtitleText) {
    const words = subtitleText.trim().toLowerCase().split(/\s+/);
    let sigmlArray = [];

    const processWord = (word) => {
        const hamnosysWord = window.glossData[word];

        if (hamnosysWord) {
            const result = conversionHamNoSysSigml(hamnosysWord);
            sigmlArray.push(result);
            console.log(`Processed word "${word}" to SiGML`);
        } else if (window.otherWords.has(word)) {
            // If the word is in other_words.txt, load the corresponding .sigml file
            return loadSigmlFile(word)
                .then(content => {
                    sigmlArray.push(content);
                    console.log(`Processed word "${word}" from .sigml file`);
                });
        } else {
            // Separate the word into individual letters and load corresponding .sigml files
            return loadSigmlFilesForLetters(word)
                .then(contents => {
                    sigmlArray = sigmlArray.concat(contents);
                    console.log(`Processed letters of the word "${word}" to SiGML`);
                });
        }
        return Promise.resolve();
    };

    // Process each word sequentially and then return the accumulated SiGML array
    return words.reduce((promiseChain, currentWord) => {
        return promiseChain.then(() => processWord(currentWord));
    }, Promise.resolve()).then(() => {
        return sigmlArray; // Return the array of SiGML files
    });
}

function loadSigmlFile(gloss) {
    const filePath = `static/SignFiles/${gloss}.sigml`;

    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`File not found: ${filePath}`);
            }
            return response.text();
        });
}

function loadSigmlFilesForLetters(word) {
    const letters = word.split('');
    const promises = letters.map(letter => {
        const filePath = `static/SignFiles/${letter.toUpperCase()}.sigml`;
        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`File not found: ${filePath}`);
                }
                return response.text();
            });
    });

    return Promise.all(promises);
}

function conversionHamNoSysSigml(hamnosysWord) {
    let data = {
        sigml: {
            hns_sign: []
        }
    };
    let glossesSigml = [];
    let hamnosysContent = Array.from(hamnosysWord);
    let codesList = [];

    // Decode the HamNoSys characters into hexadecimal unicode strings
    for (let char of hamnosysContent) {
        let hamnosysCode = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
        codesList.push(hamnosysCode);
    }

    // Convert the list of codes into SiGML
    glossesSigml = readLists(codesList);

    // Write the SiGML XML
    return writeSiGML(glossesSigml, data);
}

function readLists(codes) {
    let glossesHamnosys = codes.map(code => [null, code]);
    let glossesSigml = [];

    for (let [gloss, code] of glossesHamnosys) {
        let aux = hamnosysList(code);
        glossesSigml = glossesSigml.concat(readCode(gloss, aux));
    }

    return glossesSigml;
}

function hamnosysList(codes) {
    let hamnosysList = [];
    let n = 4; // Each HamNoSys code has 4 characters

    for (let j = 0; j < codes.length; j += n) {
        let singleCode = codes.slice(j, j + n);
        hamnosysList.push(singleCode);
    }

    return hamnosysList;
}

function readCode(gloss, hamnosys) {
    let sigmlList = [];

    // Match the hamnosys code to its corresponding sigml code using the loaded conversionData
    hamnosys.forEach(code => {
        if (window.conversionData[code]) {
            sigmlList.push([gloss, window.conversionData[code]]);
        }
    });

    return sigmlList;
}

function writeSiGML(glossesSigml, data) {
    if (!glossesSigml || glossesSigml.length === 0) {
        return "";
    }

    // Create the structure for a single hns_sign with one hamnosys_nonmanual and one hamnosys_manual
    let itemGloss = {
        'hamnosys_nonmanual': {},
        'hamnosys_manual': []
    };

    // We need to add each sigml_code inside the hamnosys_manual array in the order it appears
    glossesSigml.forEach(([gloss, sigmlCode]) => {
        itemGloss['hamnosys_manual'].push({
            [sigmlCode]: {}
        });
    });

    // Push the completed itemGloss structure to the data.sigml.hns_sign array
    data.sigml.hns_sign.push(itemGloss);

    // Convert the object to an XML string manually
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sigml>';
    data.sigml.hns_sign.forEach(sign => {
        xml += '\n  <hns_sign>';
        xml += '\n    <hamnosys_nonmanual/>';
        xml += '\n    <hamnosys_manual>';
        sign.hamnosys_manual.forEach(manual => {
            const tag = Object.keys(manual)[0];
            xml += `\n      <${tag}/>`;
        });
        xml += '\n    </hamnosys_manual>';
        xml += '\n  </hns_sign>';
    });
    xml += '\n</sigml>';

    return xml;
}