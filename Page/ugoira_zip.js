(function() {
    ["jszip.min.js"].forEach(function(value) {
        var script = document.createElement("script");
        script.src = "https://pucpunpew.github.io/SoulWorker-Backup-Files/Page/" + value;
        document.body.appendChild(script);
    });
    var title = document.querySelector(".work-info .title");
    title.appendChild(document.createElement("br"));
    [{
        name: "Zip",
        data: pixiv.context.ugokuIllustData
    },{
        name: "ZipHQ",
        data: pixiv.context.ugokuIllustFullscreenData
    }].forEach(function(value) {
        var elem, elemtxt, click;
        click = function() {
            if ("removeEventListener" in elem) {
                elem.removeEventListener("click", click);
            } else {
                elem.detachEvent("onclick", click);
            }
            var basename = pixiv.context.illustId + "_" + pixiv.context.illustTitle.replace(/[\\/:*?"<>|\u00b7]/g, "");
            var savename = basename + value.name + ".ugoira";
            if (typeof Blob === "undefined"){
                elemtxt.nodeValue = " >Save" + value.name + "< ";
                elem.href = value.data.src;
                elem.download = savename;
            } else {
                elemtxt.nodeValue = " >Loading" + value.name + "...< ";
                var xhr = new XMLHttpRequest();
                xhr.open("GET", value.data.src);
                xhr.responseType = "arraybuffer";
                xhr.addEventListener("load", function() {
                    elemtxt.nodeValue = " >Save" + value.name + "< ";
					JSZip.loadAsync(xhr.response).then(function(zip) {
						zip.file("animation.json", JSON.stringify(pixiv.context));
						
						zip.generateAsync({type:"blob"}).then(function(blob) {
							if ("msSaveOrOpenBlob" in window.navigator) {
								elem.addEventListener("click", function() {
									window.navigator.msSaveOrOpenBlob(blob, savename);
								});
							} else {
								elem.href = window.URL.createObjectURL(blob);
								elem.download = savename;
							}
						});
					});
                    /* 
					var zip = new JSZip(xhr.response);
					var blob = zip.generate({type:"blob"});
                    if ("msSaveOrOpenBlob" in window.navigator) {
                        elem.addEventListener("click", function() {
                            window.navigator.msSaveOrOpenBlob(blob, savename);
                        });
                    } else {
                        elem.href = window.URL.createObjectURL(blob);
                        elem.download = savename;
                    }
					*/
                });
                xhr.addEventListener("error", function() {
                    elemtxt.nodeValue = " >Error" + value.name + "< ";
                });
                xhr.send();
            }
        };
        elem = document.createElement("a");
        elemtxt = document.createTextNode(" >DL" + value.name + "< ");
        elem.appendChild(elemtxt);
        elem.className = "_button";
        if ("addEventListener" in elem) {
            elem.addEventListener("click", click);
        } else {
            elem.attachEvent("onclick", click);
        }
        title.appendChild(elem);
    });
})();
