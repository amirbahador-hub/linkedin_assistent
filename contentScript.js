// import {getCurrentTime} from "./utils.js"

(() => {
    let jobInfo = {};
    let currentJob = "";
    let currentJobBookmarks = [];

    const getCurrentTime = () => {
    currentDate = new Date()
    return currentDate.getTime()
    }
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
          chrome.storage.sync.get(["bookmarks"], (obj) => {
            resolve(obj["bookmarks"] ? JSON.parse(obj["bookmarks"]) : []);
          });
        });
      };

    const newJobLoaded = async () => {
        const bookmarkBtnElement = document.getElementsByClassName("bookmark-btn")[0];
        currentJobBookmarks = await fetchBookmarks();
        if (!bookmarkBtnElement) {
            
            const bookmarkBtn = document.createElement("button");
            const btns = document.querySelectorAll(".job-details-jobs-unified-top-card__content--two-pane > .mt5 > .display-flex")[0]
            bookmarkBtn.className = "bookmark-btn";
            let classesToAdd = [ 'job-save-button', 'artdeco-button', 'artdeco-button--3' , 'artdeco-button--secondary'];
            bookmarkBtn.classList.add(...classesToAdd);
            bookmarkBtn.type = "button"
            bookmarkBtn.innerHTML = "<span>BookMark</span>"
            btns.appendChild(bookmarkBtn)
            bookmarkBtn.addEventListener("click", addNewJobEventHandler);
        }
    }
    const addNewJobEventHandler = async () => {
        const dsc = document.querySelectorAll(".job-details-jobs-unified-top-card__primary-description-without-tagline")[0]
        const company = dsc.querySelectorAll(".app-aware-link")[0]
        const title = document.querySelectorAll(".job-details-jobs-unified-top-card__job-title")[0]
        const position = title.innerText
        const url = title.querySelectorAll("a")[0].href
        const company_name = company.innerText
        const company_url = company.href
        const description = dsc.innerText
        jobInfo = {
            "position": position,
            "url": url,
            "company_name": company_name,
            "company_url": company_url,
            "description": description,
            "time": getCurrentTime(),
        }
        currentJobBookmarks = await fetchBookmarks();
        chrome.storage.sync.set({
            ["bookmarks"]: JSON.stringify([...currentJobBookmarks, jobInfo].sort((a, b) => a.time - b.time))
          });

    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, jobId } = obj;

        if (type === "NEW") {
            currentJob = jobId;
            newJobLoaded();
        } else if (type === "PLAY") {
            console.log(currentJob)
          } else if ( type === "DELETE") {
            currentJobBookmarks = currentJobBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({
            ["bookmarks"]: JSON.stringify([...currentJobBookmarks].sort((a, b) => a.time - b.time))
          });
            response(currentJobBookmarks);
          }
    });

    newJobLoaded()
})();


// document.querySelectorAll(".job-details-jobs-unified-top-card__content--two-pane > .mt5 > .display-flex")
{/* <button class="jobs-save-button artdeco-button artdeco-button--3 artdeco-button--secondary" type="button">
<!---->          <span aria-hidden="true">
            Save
          </span>
        <span class="a11y-text">
          Save Quantum DevOps Engineer (remote-ish) at Qruise
        </span>
    </button> */}

            // bookmarkBtn.innerHTML = '<button class="jobs-save-button artdeco-button artdeco-button--3 artdeco-button--secondary" type="button"><span aria-hidden="true">BookMark</span>'