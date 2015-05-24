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

background.initialize = function() {
    background.checkForValidUrl_();
    background.listenForRequests_();
    chrome.storage.local.get('calendars', function(storage) {
        console.log(storage['calendars']);
    });
};

background.log = function(msg) {
    console.log(msg);
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

background.listenForRequests_ = function () {
    chrome.runtime.onMessage.addListener(function(request, sender, optCallback) {
        switch (request.method) {
            case "pgaction.changeOKIcon":
                console.log("sender.tab.id: " + sender.tab.id);
                chrome.pageAction.setIcon({
                    tabId: sender.tab.id,
                    path: {
                        "19": "icons/i2c_ok_19.png",
                        "38": "icons/i2c_ok_38.png"
                    }
                });
                break;
                
            case "pgaction.changeNGIcon":
                chrome.pageAction.setIcon({
                    tabId: sender.tab.id,
                    path: {
                        "19": "icons/i2c_ng_19.png",
                        "38": "icons/i2c_ng_38.png"
                    }
                });
                break;
        }
    });
}

background.initialize();
