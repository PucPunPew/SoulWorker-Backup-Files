(async function (w) {
    let myCacheStorage = w.sessionStorage;
    function importJS(link) {
        var script = document.createElement("script"),
            returnResult = new Promise(function (resolve, reject) {
                script.onload = function () {
                    resolve();
                }
            });
        script.src = link;
        document.body.appendChild(script);
        return returnResult;
    }
    function getIllustrationID() {
        return (new URLSearchParams(w.location.search)).get("illust_id");
    }
    function ___getIllustrationData(url) {
        return new Promise(function (resolve, reject) {
            fetch(url)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then(function (json) {
                            if (json.error === false) {
                                resolve(json.body);
                            } else {
                                reject(json.message);
                            }
                        }).catch(function (err) {
                            reject(err);
                        })
                    } else {
                        reject(response.statusText);
                    }
                })
                .catch(function (reason) {
                    reject(reason);
                });
        });
        // https://www.pixiv.net/ajax/illust/71644973
    }
    function getIllustrationData(illustrationID) {
        return ___getIllustrationData("/ajax/illust/" + illustrationID);
    }
    function getUgoiraData(illustrationID) {
        return ___getIllustrationData("/ajax/illust/" + illustrationID + "/ugoira_meta");
    }

    if (!("$$$" in w) || typeof (jQuery) === "undefined") {
        var myJquery = await (new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.onload = function () {
                resolve(jQuery.noConflict());
            };
            script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";
            document.head.appendChild(script);
        }));
        Object.defineProperty(w, "$$$", {
            value: myJquery,
            writable: false,
            configurable: false,
            enumerable: true
        });
    }

    function isCache(illustrationID) {
        return (myCacheStorage.getItem("ugoiradownload_" + illustrationID) !== undefined);
    }

    function getCache(illustrationID) {
        let item = myCacheStorage.getItem("ugoiradownload_" + illustrationID);
        if (!item) {
            return null;
        }
        return JSON.parse(item);
    }

    function setCache(illustrationID, cacheData, overwrite = false) {
        if (!overwrite && isCache(illustrationID)) {
            let myresult = Object.assign(getCache(illustrationID), cacheData);
            myCacheStorage.setItem("ugoiradownload_" + illustrationID, JSON.stringify(myresult));
            return myresult;
        } else {
            myCacheStorage.setItem("ugoiradownload_" + illustrationID, JSON.stringify(cacheData));
            return cacheData;
        }
    }

    /*
    ["jszip.min.js"].forEach(function (value) {
        var script = document.createElement("script");
        script.src = "https://pucpunpew.github.io/SoulWorker-Backup-Files/Page/" + value;
        document.body.appendChild(script);
    });
    */
    //img-container
    var cssStyle = `.ugoira-downloader-ui{position:fixed;top:50%;left:10px;transform:translateY(-50%);background-color:rgba(0,0,0,.5)!important}.ugoira-downloader-ui button{display:block;border-radius:30px padding: 10px}`;

    var downloadPanel = document.querySelector(".ugoira-downloader-ui"),
        isInit = (downloadPanel ? true : false);

    if (!isInit) {
        downloadPanel = document.createElement("div");
        downloadPanel.className = "ugoira-downloader-ui";
        document.body.appendChild(downloadPanel);

        var linkElement = window.document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');
        linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(cssStyle));
        document.head.appendChild(linkElement);
        linkElement = null;

        await importJS("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.0/jszip.min.js");
        // downloadPanel.parentElement.insertBefore(document.createElement("br"), downloadPanel.nextSibling);
    }
    var $downloadPanel = $$$(downloadPanel);

    var illustID = getIllustrationID();
    if (!illustID) {
        $downloadPanel.empty();
        $downloadPanel.text("Ugoira Download: Error: Cannot fetch illustration ID from URL");
        return;
    }
    $downloadPanel.empty();
    $downloadPanel.text("Ugoira Download: Fetching illustration info");

    var myCachedObject = getCache(illustID);
    if (!myCachedObject) {
        try {
            let illustDataFromServer = await getIllustrationData(illustID);
            myCachedObject = setCache(illustID, {
                metadata: {
                    illustComment: illustDataFromServer.illustComment,
                    illustId: illustDataFromServer.illustId,
                    illustTitle: illustDataFromServer.illustTitle,
                    userId: illustDataFromServer.userId,
                    userName: illustDataFromServer.userName,
                    ugokuIllustData: null
                },
                normalSizePromiseLink: "",
                originalSizePromiseLink: ""
            });
        } catch (err) {
            $downloadPanel.empty();
            $downloadPanel.text("Ugoira Download: Error: " + err);
            return;
        }
    }

    /*
    dummyJSONAnimation.illustComment = illustDataFromServer.illustComment;
    dummyJSONAnimation.illustId = illustDataFromServer.illustId;
    dummyJSONAnimation.illustTitle = illustDataFromServer.illustTitle;
    dummyJSONAnimation.userId = illustDataFromServer.userId;
    dummyJSONAnimation.userName = illustDataFromServer.userName;
    dummyJSONAnimation.ugokuIllustData = ugoiraMeta.body;
    */
    // "https://www.pixiv.net/ajax/illust/" + ugoiraInfo.illustId + "/ugoira_meta"

    var awaitingDummy;
    if (!myCachedObject.metadata.ugokuIllustData) {
        awaitingDummy = getUgoiraData(illustID);
        awaitingDummy.then(function (json) {
            Object.assign(myCachedObject.metadata, {
                ugokuIllustData: json
            });
            myCachedObject = setCache(illustID, myCachedObject);
        });
    } else {
        awaitingDummy = Promise.resolve(myCachedObject.metadata.ugokuIllustData);
    }

    awaitingDummy.then(function (json) {
        [(function () {
            let result = {
                isOriginal: false,
                isCompleted: false,
                data: json.src
            };
            if (myCachedObject.normalSizePromiseLink) {
                result.isCompleted = true;
                result.data = myCachedObject.normalSizePromiseLink;
            }
            return result;
        })(), (function () {
            let result = {
                isOriginal: true,
                isCompleted: false,
                data: json.originalSrc
            };
            if (myCachedObject.originalSizePromiseLink) {
                result.isCompleted = true;
                result.data = myCachedObject.originalSizePromiseLink;
            }
            return result;
        })()].forEach(function (buttonData) {
            var btnTextName = (buttonData.isOriginal ? "Original Resolution" : "Normal Resolution");
            $downloadPanel.append($$$("<a>").attr("type", "button").text("> Download " + btnTextName + " <").one("click", function (e) {
                e.preventDefault();

                var myself = $$$(this),
                    basename = ugoiraInfo.illustId + "_" + ugoiraInfo.illustTitle.replace(/[\\/:*?"<>|\u00b7]/g, ""),
                    savename = basename + "-" + (buttonData.isOriginal ? "OriginalSize" : "NormalSize") + ".ugoira";

                if (buttonData.isCompleted) {
                    myself.attr("href", buttonData.data).attr("download", savename);
                    myself.text("> Save " + btnTextName + " <");
                } else {
                    myself.text("> Downloading " + btnTextName + " <");
                    fetch(buttonData.data).then(function (response) {
                        if (response.ok) {
                            response.arrayBuffer().then(function (arrayBuffer) {
                                JSZip.loadAsync(arrayBuffer).then(function (zip) {
                                    zip.file("animation.json", JSON.stringify(myCachedObject.metadata));

                                    var myZipOption = {
                                        type: "blob",
                                        compression: "DEFLATE",
                                        compressionOptions: { level: 9 }
                                    };
                                    if (myCachedObject.metadata.illustComment) {
                                        myZipOption.comment = myCachedObject.metadata.illustComment;
                                    }

                                    zip.generateAsync(myZipOption).then(function (blob) {
                                        var myObjectUrl = window.URL.createObjectURL(blob);
                                        if (buttonData.isOriginal) {
                                            myCachedObject = setCache(illustID, {
                                                originalSizePromiseLink: myObjectUrl
                                            });
                                        } else {
                                            myCachedObject = setCache(illustID, {
                                                normalSizePromiseLink: myObjectUrl
                                            });
                                        }
                                        myself.attr("href", myObjectUrl).attr("download", savename);
                                        myself.text("> Save " + btnTextName + " <");
                                    }).catch(function (reason) {
                                        myself.text("> Error [5]: " + reason + " <");
                                    });
                                }).catch(function (reason) {
                                    myself.text("> Error [4]: " + reason + " <");
                                });
                            }).catch(function (reason) {
                                myself.text("> Error [3]: " + reason + " <");
                            });
                        } else {
                            myself.text("> Error [2]: " + response.statusText + " <");
                        }
                    }).catch(function (reason) {
                        myself.text("> Error [1]: " + reason + " <");
                    });
                }
            }));
        });

    }).catch(function (err) {
        $downloadPanel.empty();
        $downloadPanel.text("Ugoira Download: Error: " + err);
    });
})(window);
