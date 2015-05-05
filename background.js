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

var background = {};

background.selectedTab;
background.title   = "";
background.content = "";
background.emails = [];
background.dates = [];


background.initialize = function() {
    background.listenRequest_();
    background.checkForValidUrl_();
};

background.log = function(msg) {
    console.log(msg);
}

background.listenRequest_ = function () {
    chrome.runtime.onMessage.addListener(function(request, sender, optCallback) {
        switch (request.method) {
            case "pgaction.getData":
                  console.log("---pgaction.getData---");
                  if (optCallback) {
                      optCallback({
                          content: background.content,
                          title: background.title,
                          dates: background.dates,
                          emails: background.emails});
                  }
                  break;
            case "monitoring.sendData":
                  background.content = request.content;
                  background.title   = request.title;
                  background.dates   = request.dates;
                  background.emails  = request.emails;
                  break;
        }
    });
}

background.checkForValidUrl_ = function () {
    chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
        if (tab.url.indexOf(constants.GITHUB_URL) > -1
                && tab.url.indexOf('issues') > -1) {
            chrome.pageAction.show(tab.id);
            chrome.tabs.sendMessage(tab.id, {method: "background.startMonitoring"});
            background.selectedTab = tab.id;
        }
    });
}

background.initialize();
