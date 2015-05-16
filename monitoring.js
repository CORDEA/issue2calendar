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
 * date  : 2015-05-03
 */

var monitoring = {};

monitoring.onchange = 0;

monitoring.title = "";
monitoring.content = "";

monitoring.mentionUsers = 0;
monitoring.dates  = [];
monitoring.emails = [];

monitoring.initialize = function () {
    console.log("---monitoring.initialize---");
    monitoring.listenRequests_();
}

monitoring.sendRequests_ = function () {
    chrome.extension.sendMessage({method: "monitoring.sendData",
        content: monitoring.content,
        title: monitoring.title,
        dates: monitoring.dates,
        emails: monitoring.emails});
}

monitoring.listenRequests_ = function () {
    chrome.runtime.onMessage.addListener( function(request, sender, optCallback) {
        switch (request.method) {
            case 'background.startMonitoring':
                monitoring.rewriteFormTag_();
                break;
        }
    });
}

monitoring.rewriteFormTag_ = function () {
    console.log("---monitoring.rewriteFormTag_---");
    var title = document.getElementById("issue_body");
    var issue = document.getElementById("issue_title");
    monitoring.extractFromForm_(issue.value);
    issue.addEventListener(
            "input", function(){monitoring.textChange_(this.value, true)}, false);
    issue.addEventListener(
            "blur", function(){monitoring.textChange_(this.value, false)}, false);
    title.addEventListener(
            "blur", function(){monitoring.textChange_(this.value, false)}, false);
}

monitoring.textChange_ = function (str, flag) {
    console.log("---monitoring.textChange_---");
    if (monitoring.onchange % 1 === 0 || !flag) {
        monitoring.extractFromForm_(str);
    }
    ++monitoring.onchange;
}

monitoring.extractFromForm_ = function (str) {
    var title = document.getElementById("issue_title");
    monitoring.title = title.value;
    mdparser.checkMarkdown(str);
    monitoring.sendRequests_();
}

monitoring.initialize();
