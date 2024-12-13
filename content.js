console.log("Content script injected successfully!");

// Use the universal selector to capture all elements
const SELECTORS = ["*"];

function getTextInfo() {
  console.log("Scanning elements for text and style information...");

  // Query all elements on the page
  const elements = document.querySelectorAll(SELECTORS.join(","));
  const textInfo = [];

  elements.forEach((element, index) => {
    try {
      const computedStyle = window.getComputedStyle(element);
      const textContent = element.innerText?.trim() || "";

      // Filter out elements without meaningful content or those not visible
      if (
        textContent &&
        computedStyle.display !== "none" &&
        computedStyle.opacity !== "0"
      ) {
        textInfo.push({
          textContent,
          fontSize: computedStyle.fontSize || "N/A",
          fontFamily: computedStyle.fontFamily || "N/A",
          fontWeight: computedStyle.fontWeight || "N/A",
          lineHeight: computedStyle.lineHeight || "N/A",
          color: computedStyle.color || "N/A",
          selector: getCssSelector(element),
        });
      }
    } catch (err) {
      console.warn(`Error processing element at index ${index}:`, err);
    }
  });

  // Store and send the collected text info
  console.log(`Collected information for ${textInfo.length} elements.`);
  chrome.storage.local.set({ textInfo }, () => {
    console.log("Data saved to chrome.storage.local.");
  });
  chrome.runtime.sendMessage(
    { action: "textInfo", data: textInfo },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Message sent successfully.");
      }
    }
  );
}

function getCssSelector(element) {
  try {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
        path.unshift(selector);
        break;
      } else {
        let sib = element,
          nth = 1;
        while ((sib = sib.previousElementSibling)) nth++;
        selector += `:nth-child(${nth})`;
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(" > ");
  } catch (err) {
    console.error("Error generating CSS selector:", err);
    return "N/A";
  }
}

// Set up a mutation observer to watch for DOM changes
const observer = new MutationObserver(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("DOM changed, rescanning...");
    getTextInfo();
  }, 300);
});

let debounceTimer;
observer.observe(document.body, { childList: true, subtree: true });

// Run the function on initial load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired.");
    getTextInfo();
  });
} else {
  console.log("Document ready, scanning immediately.");
  getTextInfo();
}