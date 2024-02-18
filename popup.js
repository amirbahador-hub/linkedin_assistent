import {getActiveTabURL} from "./utils.js"
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarks, bookmark) => {
    const bookmarkTitleElement = document.createElement("a");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
  
    bookmarkTitleElement.textContent = bookmark.company_name;
    bookmarkTitleElement.className = "bookmark-title";
    bookmarkTitleElement.setAttribute("href", bookmark.url);
    controlsElement.className = "bookmark-controls";
  
    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);
  
    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);
  
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarks.appendChild(newBookmarkElement);
  };
  
  const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";
  
    if (currentBookmarks.length > 0) {
      for (let i = 0; i < currentBookmarks.length; i++) {
        const bookmark = currentBookmarks[i];
        addNewBookmark(bookmarksElement, bookmark);
      }
    } else {
      bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
    }
  
    return;
  };

const onPlay = async e => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
  
    const currentJob = urlParameters.get("currentJobId");
  
    if (activeTab.url.includes("linkedin.com/jobs/collections") && currentJob) {
      chrome.storage.sync.get(["bookmarks"], (data) => {
        const currentJobBookmarks = data["bookmarks"] ? JSON.parse(data["bookmarks"]) : [];
  
        viewBookmarks(currentJobBookmarks);
      });
    } else {
      const container = document.getElementsByClassName("container")[0];
  
      container.innerHTML = '<div class="title">This is not a Linkedin Job/collection page.</div>';
    }
  });