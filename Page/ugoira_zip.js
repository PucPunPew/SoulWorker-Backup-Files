(function () {
    ["jszip.min.js"].forEach(function (value) {
        var script = document.createElement("script");
        script.src = "https://pucpunpew.github.io/SoulWorker-Backup-Files/Page/" + value;
        document.body.appendChild(script);
    });
    //img-container
    var articleDom = document.querySelector("div div article"),
        theline = document.querySelector("div div div.ugoiradownload");
    if (!articleDom)
        articleDom = document.querySelector(".cool-work-main .img-container");
    if (!theline) {
        theline = document.createElement("div");
        theline.className = "ugoiradownload";
        articleDom.parentElement.insertBefore(theline, articleDom);
        theline.parentElement.insertBefore(document.createElement("br"), theline.nextSibling);
    } else {
        var cNode = theline.cloneNode(false);
        theline.parentNode.replaceChild(cNode, theline);
    }
    if (!window.globalInitData) {
        var elemtxt = document.createTextNode("Error: Please login");
        theline.appendChild(elemtxt);
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
        if (ugoiraMeta.mime) {

        }
        dummyJSONAnimation.illustComment = ugoiraInfo.illustComment;
        dummyJSONAnimation.illustId = ugoiraInfo.illustId;
        dummyJSONAnimation.illustTitle = ugoiraInfo.illustTitle;
        dummyJSONAnimation.userId = authorInfo.userId;
        dummyJSONAnimation.userName = authorInfo.name;
        dummyJSONAnimation.ugokuIllustData = ugoiraMeta.body;
        if (ugoiraMeta.error === false) {
            //articleDom.parentElement.insertBefore(theline, articleDom);
            [{
                name: "Zip",
                data: ugoiraMeta.body.src
            }, {
                name: "ZipHQ",
                data: ugoiraMeta.body.originalSrc
            }].forEach(function (value) {
                var elem, elemtxt, click;
                click = function () {
                    if ("removeEventListener" in elem) {
                        elem.removeEventListener("click", click);
                    } else {
                        elem.detachEvent("onclick", click);
                    }
                    var basename = ugoiraInfo.illustId + "_" + ugoiraInfo.illustTitle.replace(/[\\/:*?"<>|\u00b7]/g, "");
                    var savename = basename + value.name + ".ugoira";
                    if (typeof Blob === "undefined") {
                        elemtxt.nodeValue = " >Save" + value.name + "< ";
                        elem.href = value.data;
                        elem.download = savename;
                    } else {
                        elemtxt.nodeValue = " >Loading" + value.name + "...< ";
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", value.data);
                        xhr.responseType = "arraybuffer";
                        xhr.addEventListener("load", function () {
                            elemtxt.nodeValue = " >Save" + value.name + "< ";
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
                elem = document.createElement("button");
                elem.type = "button";
                elemtxt = document.createTextNode(" >DL" + value.name + "< ");
                elem.appendChild(elemtxt);
                elem.className = "YryPnZn";
                if ("addEventListener" in elem) {
                    elem.addEventListener("click", click);
                } else {
                    elem.attachEvent("onclick", click);
                }
                theline.appendChild(elem);
            });
        } else {
            var elemtxt;
            if (ugoiraMeta.message)
                elemtxt = document.createTextNode("Error:" + ugoiraMeta.message);
            else
                elemtxt = document.createTextNode("Error:" + ugoiraMeta.error);
            theline.appendChild(elemtxt);
        }
    });
    xhrMain.addEventListener("error", function () {
        var elemtxt = document.createTextNode("Error: Cannot send request for ugoira metadata");
        theline.appendChild(elemtxt);
        // elemtxt.nodeValue = " >Error" + value.name + "< ";
    });
    xhrMain.send();
})();
