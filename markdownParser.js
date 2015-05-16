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

var mdparser = {};

mdparser.checkMarkdown = function (str) {
    console.log("---checkMarkdown---");
    var lines = str.split('\n');
    var startRegex = "[-+*]+\\s+";
    var endRegex   = "\\s*:\\s*";

    var content = "";
    var regex = new RegExp(startRegex + "period" + endRegex);
    content = str.split(regex)[0];

    for (var j in lines) {
        if (regex.test(lines[j])) {
            var parameter = lines[j].replace(regex, '');
            if (monitoring.dates.length !== 2) {
                var res = mdparser.periodParser_(parameter);
                if (res != 1) {
                    monitoring.dates = res;
                    var dates = res;
                }
            }
            break;
        }
    }

    regex = new RegExp(startRegex + "mention" + "\\s*\\n+");
    monitoring.content = content.split(regex)[0];
    if (regex.test(str)) {
        var res = mdparser.mentionParser_(str.split(regex)[1]);
    }
}

mdparser.periodParser_ = function (str) {
    console.log("---periodParser_---");
    var separator = "[-~]";
    var regex = new RegExp("\\s+" + separator + "\\s+");
    var dates = str.split(regex);
    if (dates.length > 1) {
        for (var i in dates) {
            var res = mdparser.checkDateSyntax_(dates[i]);
            if (res === 1) {
                return 1;
            }
            dates[i] = res;
        }
    }
    return dates;
}

mdparser.checkDateSyntax_ = function (datetime) {
    var datetime = datetime.split(' ');
    var date = datetime[0];
    var time = datetime.length === 2 && datetime[1];
    var formatDate = '';

    var regex = new RegExp('[/]', 'g');
    date = date.replace(regex, '-');
    var dateSyntax = new RegExp("2\\d{3}-[01]*\\d-[0-3]*\\d");
    if (dateSyntax.test(date)) {
        formatDate += date;
    }

    var timeSyntax = new RegExp("[0-2]*\\d:[0-5]*\\d:[0-5]*\\d");
    if (timeSyntax.test(time)) {
        formatDate += time;
    }

    return mdparser.convertDateToIsoString_(formatDate);
}

mdparser.convertDateToIsoString_ = function (date) {
    if (date.length === 0) {
        return 1;
    }
    formatDate = new Date(date);
    formattedDate = formatDate.toISOString().slice(0, -1) + "+09:00";
    return formattedDate;
}

mdparser.mentionParser_ = function (str) {
    console.log("---mentionParser_---");

    var regex = new RegExp("\\s{4}[-+*]\\s+@");
    var lines = str.split('\n');
    for (var i in lines) {
        if (regex.test(lines[i])) {
            var user = lines[i].replace(regex, '');
            var url  = "https://github.com/" + user;
            mdparser.urlParser_(url);
            ++monitoring.mentionUsers;
        }
    }
}

mdparser.urlParser_ = function (url) {
    var mailTag = '<a class="email" href=".+">(.+)</a>';
    var emailRegex = new RegExp(mailTag);
    $.get(url, function(data){
        emailRegex.exec(data);
        var email = '';
        var hexChars = RegExp.$1.split(";");
        for (var i in hexChars) {
            if (hexChars[i].length > 0) {
                var hex = hexChars[i].replace("&#", "\\");
                email += String.fromCharCode(parseInt(hex.substr(2), 16));
            }
        }

        if (email.indexOf('@') > -1) {
            monitoring.emails.push(email);
        }
    });
}
