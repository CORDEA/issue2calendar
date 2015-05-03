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


var content = {};

content.dates = [];

content.initialize = function () {
    console.log("initialize");
    content.listenRequests_();
}

content.listenRequests_ = function () {
    chrome.runtime.onMessage.addListener( function(msg, sender) {
        switch (msg.text) {
            case 'rewrite':
                console.log("rewrite");
                content.rewriteFormTag_();
                break;
        }
    });
}

content.rewriteFormTag_ = function () {
    var form = document.getElementsByClassName("js-new-comment-form")[0];
    form.elements["comment[body]"].addEventListener(
            "input", function(){content.textChange(this.value)}, false);
}

content.textChange = function (str) {
    mdparser.checkMarkdown(str);
}

content.initialize();
