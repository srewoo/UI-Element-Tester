document.addEventListener("DOMContentLoaded", async () => {
    const textList = document.getElementById("textList");
    const clearButton = document.getElementById("clearButton");
    const exportButton = document.getElementById("exportButton");
    const feedbackMessage = document.getElementById("feedbackMessage");

    // Request recorded data from the background script
    chrome.runtime.sendMessage({ action: "getRecordingData" }, (response) => {
        const textInfo = response.textInfo || [];
        const uniqueTextInfo = removeDuplicates(textInfo);
        displayTextInfo(uniqueTextInfo);
    });

    // Clear the text info when the "Clear List" button is clicked
    clearButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "clearRecording" }, () => {
            textList.innerHTML = "<tr><td colspan='6'>List cleared.</td></tr>";
            showFeedback("List successfully cleared!");
        });
    });

    // Export the text info to a CSV file
    exportButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "getRecordingData" }, (response) => {
            const textInfo = response.textInfo || [];
            if (textInfo.length > 0) {
                exportToCSV(textInfo);
            } else {
                alert("No data available to export.");
            }
        });
    });

    // Function to display text info in the table format
    function displayTextInfo(textInfo) {
        if (textInfo.length > 0) {
            textList.innerHTML = textInfo
                .map(({ textContent, fontSize, fontFamily, fontWeight, lineHeight, color }) => `
                    <tr>
                        <td>${textContent.trim()}</td>
                        <td>${fontSize.trim()}</td>
                        <td>${fontFamily.trim()}</td>
                        <td>${fontWeight.trim()}</td>
                        <td>${lineHeight.trim()}</td>
                        <td>${color.trim()}</td>
                    </tr>`)
                .join("");
        } else {
            textList.innerHTML = "<tr><td colspan='6'>No text found.</td></tr>";
        }
    }

    // Function to remove duplicate entries
    function removeDuplicates(textInfo) {
        const seen = new Set();
        return textInfo.filter(({ textContent, fontSize, fontFamily }) => {
            const identifier = `${textContent}-${fontSize}-${fontFamily}`;
            if (seen.has(identifier)) return false;
            seen.add(identifier);
            return true;
        });
    }

    // Function to show feedback messages
    function showFeedback(message) {
        feedbackMessage.textContent = message;
        feedbackMessage.style.opacity = "1";
        setTimeout(() => {
            feedbackMessage.style.opacity = "0";
        }, 3000);
    }

    // Function to export data to a CSV file
    function exportToCSV(data) {
        const headers = ["Text", "Font Size", "Font Family", "Font Weight", "Line Height", "Color"];
        const rows = data.map(({ textContent, fontSize, fontFamily, fontWeight, lineHeight, color }) => [
            textContent,
            fontSize,
            fontFamily,
            fontWeight,
            lineHeight,
            color
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${value}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "text_info.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});