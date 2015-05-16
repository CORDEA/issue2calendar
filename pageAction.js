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

pgaction.initialize = function () {
    pgaction.log("---pgaction.initialize---");
    pgaction.addOptionToSelectBox_();
    pgaction.showAuthButtonIfNotAuth_();
    pgaction.sendRequests_();
    pgaction.addEventToButton_();
    // pgaction.listenRequests_();
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

pgaction.sendRequests_ = function () {
    chrome.runtime.sendMessage({method: "pgaction.getData"}, function (response) {
        pgaction.log(response.title);

        var start;
        var end;
        if (response.dates.length > 1) {
            start = response.dates[0];
            end   = response.dates[1];
        } else {
            start = end = response.dates[0];
        }

        var mentions = "";
        for (var i in response.emails) {
            if (i == (response.emails.length - 1)) {
                mentions += response.emails[i];
            } else {
                mentions += response.emails[i] + ", ";
            }
        }

        document.getElementsByName("content")[0].value = response.content;
        document.getElementsByName("title")[0].value   = response.title;
        document.getElementsByName("start")[0].value   = start;
        document.getElementsByName("end")[0].value     = end;
        document.getElementsByName("mention")[0].value = mentions;
    });
}

pgaction.listenRequests_ = function () {
    chrome.runtime.onMessage.addListener(function (request, sender) {
    });
}

pgaction.showAuthButtonIfNotAuth_ = function () {
    console.log("---pgaction.showAuthButtonIfNotAuth---");
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

pgaction.initialize();
