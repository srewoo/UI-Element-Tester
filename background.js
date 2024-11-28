let recordingData = {
  consoleErrors: [],
  userActions: [],
  textInfo: []
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "textInfo") {
    recordingData.textInfo = request.data; // Store the array of text objects
    sendResponse({ status: "Text info recorded." });
  } else if (request.action === "getRecordingData") {
    sendResponse(recordingData);
  } else if (request.action === "clearRecording") {
    // Clear the recording data
    recordingData = { consoleErrors: [], userActions: [], textInfo: [] };
    sendResponse({ status: "Recording cleared." });
  } else {
    sendResponse({ status: "Unknown action." });
  }
  return true; // Keep the message channel open for asynchronous responses
});
