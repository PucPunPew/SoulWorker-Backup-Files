(function () {
    if (window.ugoiradownloadLoaded === true)
        return;
    window.ugoiradownloadLoaded = true;
    function importJS(link) {
        var script = document.createElement("script");
        script.src = link;
        document.body.appendChild(script);
    }
    /*
    ["jszip.min.js"].forEach(function (value) {
        var script = document.createElement("script");
        script.src = "https://pucpunpew.github.io/SoulWorker-Backup-Files/Page/" + value;
        document.body.appendChild(script);
    });
    */
    //img-container
    var cssStyle = `
.ugoira-downloader-ui {
    position: fixed;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
}
    `;

    var downloadPanel = document.querySelector(".ugoira-downloader-ui"),
        isInit = (downloadPanel ? true : false);

    if (!isInit) {
        importJS("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.0/jszip.min.js");

        var linkElement = window.document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(cssStyle));
        document.head.appendChild(linkElement);

        downloadPanel = document.createElement("div");
        downloadPanel.className = "ugoira-downloader-ui";
        document.body.appendChild(downloadPanel);
        // downloadPanel.parentElement.insertBefore(document.createElement("br"), downloadPanel.nextSibling);
    }
    if (!window.globalInitData) {
        var elemtxt = document.createTextNode("Ugoira Download: Error: Please login");
        downloadPanel.appendChild(elemtxt);
        return;
    }

    var ugoiraInfoTmp = window.globalInitData.preload.illust,
        ugoiraInfo, key;
    for (key in ugoiraInfoTmp)
        if (ugoiraInfoTmp.hasOwnProperty(key) && ugoiraInfoTmp[key].illustId)
            ugoiraInfo = ugoiraInfoTmp[key];

    var authorInfoTmp = window.globalInitData.preload.user,
        authorInfo;
    for (key in authorInfoTmp)
        if (authorInfoTmp.hasOwnProperty(key) && authorInfoTmp[key].name && authorInfoTmp[key].userId)
            authorInfo = authorInfoTmp[key];
    // "https://www.pixiv.net/ajax/illust/" + ugoiraInfo.illustId + "/ugoira_meta"

    var xhrMain = new XMLHttpRequest();
    xhrMain.open("GET", "https://www.pixiv.net/ajax/illust/" + ugoiraInfo.illustId + "/ugoira_meta");
    xhrMain.responseType = "json";
    xhrMain.addEventListener("load", function () {
        var ugoiraMeta = xhrMain.response,
            dummyJSONAnimation = {};
        dummyJSONAnimation.illustComment = ugoiraInfo.illustComment;
        dummyJSONAnimation.illustId = ugoiraInfo.illustId;
        dummyJSONAnimation.illustTitle = ugoiraInfo.illustTitle;
        dummyJSONAnimation.userId = authorInfo.userId;
        dummyJSONAnimation.userName = authorInfo.name;
        dummyJSONAnimation.ugokuIllustData = ugoiraMeta.body;
        if (ugoiraMeta.error === false) {
            var theSpan = document.createElement("span");
            theSpan.appendChild(document.createTextNode("Ugoira Download:"));
            downloadPanel.appendChild(theSpan);
            downloadPanel.appendChild(document.createElement("br"));
            //articleDom.parentElement.insertBefore(theline, articleDom);
            [{
                name: "Ugoira",
                fallbackName: "Zip",
                data: ugoiraMeta.body.src
            }, {
                name: "HQ-Ugoira",
                fallbackName: "ZipHQ",
                data: ugoiraMeta.body.originalSrc
            }].forEach(function (value) {
                var elem, elemtxt, click, innerelem;
                click = function () {
                    if ("removeEventListener" in elem) {
                        elem.removeEventListener("click", click);
                    } else {
                        elem.detachEvent("onclick", click);
                    }
                    var basename = ugoiraInfo.illustId + "_" + ugoiraInfo.illustTitle.replace(/[\\/:*?"<>|\u00b7]/g, "");
                    var savename = basename + value.name + ".ugoira";
                    if (typeof Blob === "undefined") {
                        elemtxt.nodeValue = " >Save " + value.fallbackName + "< ";
                        elem.href = value.data;
                        elem.download = savename;
                    } else {
                        elemtxt.nodeValue = " >Loading " + value.name + "...< ";
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", value.data);
                        xhr.responseType = "arraybuffer";
                        xhr.addEventListener("load", function () {
                            elemtxt.nodeValue = " >Save " + value.name + "< ";
                            JSZip.loadAsync(xhr.response).then(function (zip) {
                                zip.file("animation.json", JSON.stringify(dummyJSONAnimation));

                                zip.generateAsync({
                                    type: "blob",
                                    compression: "DEFLATE",
                                    comment: dummyJSONAnimation.illustComment,
                                    compressionOptions: {
                                        level: 9
                                    }
                                }).then(function (blob) {
                                    if ("msSaveOrOpenBlob" in window.navigator) {
                                        elem.addEventListener("click", function () {
                                            window.navigator.msSaveOrOpenBlob(blob, savename);
                                        });
                                    } else {
                                        elem.href = window.URL.createObjectURL(blob);
                                        elem.download = savename;
                                    }
                                });
                            });
                        });
                        xhr.addEventListener("error", function () {
                            elemtxt.nodeValue = " >Error" + value.name + "< ";
                        });
                        xhr.send();
                    }
                };
                innerelem = document.createElement("button");
                innerelem.type = "button";
                innerelem.className = "YryPnZn";
                elem = document.createElement("a");
                elemtxt = document.createTextNode(" >DL " + value.name + "< ");
                innerelem.appendChild(elemtxt);
                if ("addEventListener" in elem) {
                    elem.addEventListener("click", click);
                } else {
                    elem.attachEvent("onclick", click);
                }
                elem.appendChild(innerelem);
                downloadPanel.appendChild(elem);
                elem.parentElement.insertBefore(document.createElement("br"), elem.nextSibling);
            });
        } else {
            var elemtxt;
            if (ugoiraMeta.message)
                elemtxt = document.createTextNode("Error:" + ugoiraMeta.message);
            else
                elemtxt = document.createTextNode("Error:" + ugoiraMeta.error);
            downloadPanel.appendChild(elemtxt);
        }
    });
    xhrMain.addEventListener("error", function () {
        var elemtxt = document.createTextNode("Ugoira Download: Error: Cannot send request for ugoira metadata");
        downloadPanel.appendChild(elemtxt);
        // elemtxt.nodeValue = " >Error" + value.name + "< ";
    });
    xhrMain.send();
})();
