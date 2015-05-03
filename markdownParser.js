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
    var lines = str.split('\n');
    var startRegex = "[-+*]+\\s+";
    var endRegex   = "\\s*:\\s*";

    var priority = "period";
    var periodExists = false;
    if (str.indexOf(priority) > -1) {
        periodExists = true;
    }

    for (var j in lines) {
        var regex = new RegExp(startRegex + "([a-z]+)" + endRegex);
        if (regex.test(lines[j])) {
            var parameter = lines[j].replace(regex, '');
            console.log(content.dates);
            switch (RegExp.$1) {
                case "period":
                    if (content.dates.length !== 2) {
                        var res = mdparser.periodParser(parameter);
                        if (res != 1) {
                            content.dates = res;
                            var dates = res;
                        }
                    }
                    break;
                case "deadline":
                    if (content.dates.length === 0 || !periodExists) {
                        var res = mdparser.deadlineParser(parameter);
                        console.log(res);
                        if (res != 1) {
                            content.dates = [res];
                        }
                    }
                    break;
            }
        }
    }
}

mdparser.periodParser = function (str) {
    console.log("---periodParser---");
    var separator = "[-~]";
    var regex = new RegExp("\\s+" + separator + "\\s+");
    var dates = str.split(regex);
    if (dates.length > 1) {
        for (var i in dates) {
            var res = mdparser.checkDateSyntax(dates[i]);
            if (res === 1) {
                return 1;
            }
            dates[i] = res;
        }
    }
    return dates;
}

mdparser.checkDateSyntax = function (date) {
    var regex = new RegExp('[/]', 'g');
    date = date.replace(regex, '-');
    var dateSyntax = new RegExp("2\\d{3}-[01]*\\d-[0-3]*\\d");
    if (dateSyntax.test(date)) {
        return mdparser.convertDateToIsoString(date);
    }
    return 1;
}

mdparser.convertDateToIsoString = function (date) {
    formatDate = new Date(date);
    formattedDate = formatDate.toISOString().slice(0, -1) + "+09:00";
    return formattedDate;
}

mdparser.deadlineParser = function (str) {
    console.log("---deadlineParser---");
    return mdparser.checkDateSyntax(str);
}

mdparser.mentionParser = function (str) {
    console.log("---mentionParser---");
}
