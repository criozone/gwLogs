var config = {
    "logsContainer": {
        "id": "content"
    }
};
window.onload = async function() {
    var monitorCheckbox = document.getElementById('monitor');
    if (monitorCheckbox) {
        monitorCheckbox.addEventListener('click', function(e) {
            monitorFlag = this.checked;
            if (monitorFlag) {
                monitor();
            } else {
                stopMonitor();
            }
        },false);
    }

    var clearLogsBtn = document.getElementById('clear-logs');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', clearLogs, false);
    }

    var readLogsBtn = document.getElementById('read-logs');
    if (readLogsBtn) {
        readLogsBtn.addEventListener('click', readLogs, false);
    }

    var swpapDownBtn = document.getElementById('swap_down');
    if (swpapDownBtn) {
        swpapDownBtn.addEventListener('click', function (e) {
            document.getElementById('mock').scrollIntoView();
        }, false);
    }

    await getConfigData();
    if (!config.files) {
        console.log("Error: no log files");
    }
    //initFilters();
    readLogs();
}

function monitor() {

}

function stopMonitor() {

}

/*
{
    "files": [
        "shopbill_log",
        "request_log",
        "payee_log"
    ]
}
*/
async function getConfigData() {
    let appFilters = {};
    let response = await fetch('http://gwlogs.local/get-config-data');
    let configFiles = await response.json();

    if (!configFiles || !configFiles.files) return;
    for (var i = 0; i < configFiles.files.length; i++) {
        appFilters[configFiles.files[i]] = false;
    }
    config.files = configFiles.files;
    config.filters = appFilters;
}

function readLogs() {
    let logElems = [];
    for (let i = 0; i < config.files.length; i++) {
        logElems.push(... getLogElems(config.files[i]));
    }
    logElems.sort(function(a, b) {
        if (a.getAttribute('data-log-time') > b.getAttribute('data-log-time')) return 1;
        else if (a.getAttribute('data-log-time') < b.getAttribute('data-log-time')) return -1;
        else return 0;
    });
    appendElems(config.logsContainer, logElems)
}

function appendElems(target, elems) {
    elems.forEach(function(elem) {
        target.appendChild(elem);
    });
}

function getLogElems(filesArr) {
    var logElem;
    var logHeaderElem;
    var logBodyElem;
    var elemsArr = [];

    let logData = getLogData(filesArr);
    for (var logName in logData) {
        for (var i = 0; i < logData[logName].length; i++) {
            logElem = document.createElement('div');
            logElem.setAttribute('data-file-id', logName);

            logHeaderElem = document.createElement('div');
            logBodyElem = document.createElement('div');

            logElem.setAttribute("class", "log-item");
            logHeaderElem.setAttribute("class", "log-item-header");
            logBodyElem.setAttribute("class", "log-item-body");

            logHeaderElem.innerHTML = '<span class="log-expand"></span>' + logData[logName][i].header;
            logBodyElem.innerHTML = logData[logName][i].body;

            var logExpandElem = logHeaderElem.querySelector('span.log-expand');
            if (logExpandElem) {
                logExpandElem.addEventListener("click", logElemClicked, false);
            }

            logElem.appendChild(logHeaderElem);
            logElem.appendChild(logBodyElem);

            elemsArr.push(logElem);
        }
    }

    return elemsArr;
}

/* Fetch response:
{
    "shopbill_log": [
        {
            "time": "log time string",
            "header": "header content",
            "body": "body content"
        },
        ...
    ],
    "request_log" : [
        {
            "time": "log time string",
            "header": "header content",
            "body": "body content"
        },
        ...
    ],
    ...
}
 */
async function getLogData(postData) {
    let response = await fetch('http://gwlogs.local/get-logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(postData)
    });

    return await response.json();
}

function logElemClicked(e) {
    var logItemElem = e.target.parentElement.parentElement;

    if (!logItemElem) {
        return;
    }

    if (logItemElem.getAttribute('class') == 'log-item') {
        logItemElem.setAttribute('class', 'log-item selected');
    } else if (logItemElem.getAttribute('class') == 'log-item selected') {
        logItemElem.setAttribute('class', 'log-item');
    }
}

function clearLogs() {
    fetch('http://gwlogs.local/clear-logs')
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            var contentElem = document.getElementById("content");
            if (!contentElem) return;
            while (contentElem.firstChild) {
                contentElem.removeChild(contentElem.firstChild);
            }
        });
}

function initFilters() {
    var filtersContainer = document.getElementById('filters-container');
    var checkbox, pElem, label;
    for (var i = 0; i < config.files.length; i++) {
        checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.id = config.files[i];

        label = document.createElement('label');
        label.htmlFor = config.files[i];
        label.appendChild(document.createTextNode(config.files[i].toUpperCase()));

        checkbox.addEventListener('click', filterLogs, false);

        pElem = document.createElement('p');
        pElem.appendChild(checkbox);
        pElem.appendChild(label);

        filtersContainer.appendChild(pElem);
    }
}

function filterLogs(e) {
    config.filters[e.target.id] = this.checked;
    updateView();
}

function updateView() {

    var logItemsColl = document.querySelectorAll('.log-item');

    //console.log(logItemsColl.length);

    for (var i = 0; i < logItemsColl.length; i++) {
        if (isfiltrationEnabled()) {
            if (!config.filters[logItemsColl[i].getAttribute('data-file-id')]) {
                logItemsColl[i].style.display = "none";
            } else {
                logItemsColl[i].style.display = "block";
            }
        } else {
            logItemsColl[i].style.display = "block";
        }
    }
}

function isfiltrationEnabled() {
    for (var prop in config.filters) {
        if (config.filters[prop]) return true;
    }
    return false;
}
































