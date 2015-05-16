/**
 *
 * Copyright [2015] [Yoshihiro Tanaka]
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Yoshihiro Tanaka <contact@cordea.jp>
 * date  : 2015-05-04
 */

var pgaction = {};

pgaction.initialize_ = function () {
    pgaction.log("---pgaction.initialize_---");
    pgaction.addOptionToSelectBox_();
    pgaction.showAuthButtonIfNotAuth_();
    pgaction.getFromStorage_();
    pgaction.addEventToButton_();
}

pgaction.log = function (msg) {
    chrome.extension.getBackgroundPage().background.log(msg);
}

pgaction.addOptionToSelectBox_ = function () {
    chrome.storage.local.get("calendars", function(storage) {
        if (chrome.runtime.lastError) {
            pgaction.log(chrome.runtime.lastError.message);
            return;
        }
        var calendars = storage["calendars"];
        pgaction.log(calendars);
        for (var i in calendars) {
            pgaction.log(calendars[i].title);
            if (calendars[i].editable) {
                var sel = document.getElementById('calendars');
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(calendars[i].title));
                sel.appendChild(opt);
            }
        }
    });
}

pgaction.editGotData_ = function (issues) {
    pgaction.log(issues);
    var start = issues.dates[0];
    var end   = issues.dates[1];

    var mentions = "";
    for (var i in issues.emails) {
        if (i == (issues.emails.length - 1)) {
            mentions += issues.emails[i];
        } else {
            mentions += issues.emails[i] + ", ";
        }
    }

    document.getElementsByName("content")[0].value = issues.content;
    document.getElementsByName("title")[0].value   = issues.title;
    document.getElementsByName("start")[0].value   = start;
    document.getElementsByName("end")[0].value     = end;
    document.getElementsByName("mention")[0].value = mentions;
}

pgaction.getFromStorage_ = function () {
    chrome.storage.local.get("issues", function(storage) {
        if (chrome.runtime.lastError) {
            pgaction.log(chrome.runtime.lastError.message);
            return;
        }

        pgaction.editGotData_(storage["issues"]);
    });
}

pgaction.showAuthButtonIfNotAuth_ = function () {
    console.log("---pgaction.showAuthButtonIfNotAuth_---");
    chrome.identity.getAuthToken({"interactive": false}, function (authToken) {
        if (chrome.runtime.lastError || !authToken) {
            pgaction.refreshUI(false);
            return;
        }
        pgaction.refreshUI(true);
    });
}

pgaction.addEventToButton_ = function () {
    var authButton = document.getElementById("authbutton");
    authButton.addEventListener(
            "click", function(){calendar.requestAuthToken()}, false);
    var addButton = document.getElementById("addbutton");
    addButton.addEventListener(
            "click", function(){calendar.addEvent()}, false);
}

pgaction.refreshUI = function (authenticated) {
    if (authenticated) {
        $("#form").show();
        $("#auth").hide();
        return;
    }
    $("#form").hide();
    $("#auth").show();
}

pgaction.initialize_();
