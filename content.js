console.log("Content script injected successfully!");

// Capture console errors
const originalConsoleError = console.error;
console.error = function(...args) {
    originalConsoleError.apply(console, args);
    const errorMessage = args.map(arg => String(arg)).join(' ');
    chrome.runtime.sendMessage({
        action: "logConsoleError",
        error: errorMessage
    });
};

// Get text info for all relevant elements
function getTextInfo() {
    const elements = document.querySelectorAll('button, div, span, li, a, p, h1, h2, h3, h4, h5, h6, label, input, textarea'); // Include more relevant elements
    const textInfo = [];

    elements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const textContent = element.innerText.trim();

        // Filter out elements with no visible text
        if (textContent && textContent !== "Loading..." && !textContent.includes("placeholder")) {
            const fontSize = computedStyle.fontSize;
            const fontFamily = computedStyle.fontFamily;
            const fontWeight = computedStyle.fontWeight;
            const lineHeight = computedStyle.lineHeight;
            const color = computedStyle.color;

            textInfo.push({
                textContent: textContent,
                fontSize: fontSize,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                lineHeight: lineHeight,
                color: color
            });
        }
    });

    // Send the array of text data to the background script
    chrome.runtime.sendMessage({
        action: "textInfo",
        data: textInfo
    });
}

// Observe DOM changes for dynamically added/changed content
const observer = new MutationObserver(() => {
    getTextInfo(); // Re-run text extraction on DOM changes
});

// Start observing the document body for changes in child elements and subtree
observer.observe(document.body, {
    childList: true, // Observe when new elements are added/removed
    subtree: true,   // Observe changes in all descendant nodes
    characterData: true // Observe changes to text content directly
});

// Run getTextInfo on initial load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', getTextInfo);
} else {
    getTextInfo();
}
