document.addEventListener("DOMContentLoaded", async () => {
    const textList = document.getElementById("textList");
    const clearButton = document.getElementById("clearButton");
    const exportButton = document.getElementById("exportButton");
    const feedbackMessage = document.getElementById("feedbackMessage");
    const searchBox = document.getElementById("searchBox");
  
    chrome.storage.local.get("textInfo", ({ textInfo = [] }) => {
      displayTextInfo(removeDuplicates(textInfo));
    });
  
    clearButton.addEventListener("click", () => {
      chrome.storage.local.set({ textInfo: [] }, () => {
        textList.innerHTML = "<tr><td colspan='7'>List cleared.</td></tr>";
        showFeedback("List successfully cleared!");
      });
    });
  
    exportButton.addEventListener("click", () => {
      chrome.storage.local.get("textInfo", ({ textInfo = [] }) => {
        if (textInfo.length > 0) {
          exportToCSV(textInfo);
        } else {
          alert("No data available to export.");
        }
      });
    });
  
    searchBox.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const rows = textList.querySelectorAll("tr");
      rows.forEach(row => {
        const matches = Array.from(row.cells).some(cell => cell.textContent.toLowerCase().includes(query));
        row.style.display = matches ? "" : "none";
      });
    });
  
    function displayTextInfo(textInfo) {
      if (textInfo.length > 0) {
        textList.innerHTML = textInfo.map(info => `
          <tr>
            <td>${info.textContent}</td>
            <td>${info.fontSize}</td>
            <td>${info.fontFamily}</td>
            <td>${info.fontWeight}</td>
            <td>${info.lineHeight}</td>
            <td>${info.color}</td>
            <td>${info.selector}</td>
          </tr>`).join("");
      } else {
        textList.innerHTML = "<tr><td colspan='7'>No text found.</td></tr>";
      }
    }
  
    function removeDuplicates(textInfo) {
      const seen = new Set();
      return textInfo.filter(({ textContent, fontSize, fontFamily }) => {
        const id = `${textContent}-${fontSize}-${fontFamily}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }
  
    function showFeedback(message) {
      feedbackMessage.textContent = message;
      feedbackMessage.style.opacity = "1";
      setTimeout(() => feedbackMessage.style.opacity = "0", 3000);
    }
  
    function exportToCSV(data) {
      const headers = ["Text", "Font Size", "Font Family", "Font Weight", "Line Height", "Color", "CSS Selector"];
      const rows = data.map(d => [d.textContent, d.fontSize, d.fontFamily, d.fontWeight, d.lineHeight, d.color, d.selector]);
  
      const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `text_info_${new Date().toISOString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  });