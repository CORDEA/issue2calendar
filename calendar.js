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

var calendar = {};

calendar.CALENDAR_EVENTS_API_URL_ =
    "https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events";

calendar.CALENDAR_LIST_API_URL_ =
    'https://www.googleapis.com/calendar/v3/users/me/calendarList';

calendar.requestAuthToken = function () {
    pgaction.log("---calendar.requestAuthToken---");
    chrome.identity.getAuthToken({"interactive": true}, function (authToken) {
        if (chrome.runtime.lastError || !authToken) {
            pgaction.log("false");
            return;
        }
        pgaction.log(authToken);
        pgaction.refreshUI();
        calendar.getUserCalendars();
        return;
    });
};

calendar.addEvent = function(text, calendarId) {
    pgaction.log("---calendar.addEvent---");

    var title       = document.getElementsByName("title")[0].value;
    var content     = document.getElementsByName("content")[0].value;
    var start       = document.getElementsByName("start")[0].value;
    var end         = document.getElementsByName("end")[0].value;
    var mentions    = document.getElementsByName("mention")[0].value;

    var lineCode = new RegExp('\n', 'g');
    content = content.replace(lineCode, '\\n');
    title   = title.replace(lineCode, '');

    var elements = {
        "title":     title,
        "content":   content,
        "startTime": start,
        "endTime":   end,
        "mentions":  mentions
    }

    var selectCalendar  = document.getElementById("calendars");
    var calendarName    = selectCalendar.options[selectCalendar.selectedIndex].text;
    var calendarId;

    chrome.storage.local.get("calendars", function(storage) {
        if (chrome.runtime.lastError) {
            pgaction.log(chrome.runtime.lastError.message);
            return;
        }
        storage['calendars'] == undefined && calendar.getUserCalendars();
        var calendars = storage['calendars'];
        for (var i in calendars) {
            pgaction.log(calendars[i].title);
            if (calendars[i].title === calendarName) {
                calendar.sendAddRequestToCalendar(calendars[i].id, elements);
            }
        }
    });
}

calendar.sendAddRequestToCalendar = function (calendarId, elements) {
    pgaction.log("---calendar.sendAddRequestToCalendar---");
    var addUrl = calendar.CALENDAR_EVENTS_API_URL_.replace('{calendarId}', encodeURIComponent(calendarId));

    chrome.identity.getAuthToken({'interactive': false}, function (authToken) {
        if (chrome.runtime.lastError || !authToken) {
            pgaction.log(chrome.runtime.lastError.message);
            return;
        }

        var data =
            '{ end: {dateTime: "' + elements["endTime"] + '"},' +
            'start: {dateTime: "' + elements["startTime"] + '"},' +
            'summary: "' + elements["title"] + '",' +
            'description: "' + elements["content"] + '"}';

        pgaction.log(data);

        $.ajax({
            url: addUrl,
            data: data,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + authToken,
                'Content-Type': 'application/json'
            },
            success: function(response) {
                pgaction.log("success");
                //success
            },
            error: function(response) {
                pgaction.log(response);
                if (response.status === 401) {
                    chrome.identity.removeCachedAuthToken({ 'token': authToken }, function() {});
                }
            }

        });
    });
}

calendar.getUserCalendars = function() {
    pgaction.log("---calendar.getUserCalendars---");
    /*
       chrome.storage.local.get('calendars', function(storage) {
       if (chrome.runtime.lastError) {
       pgaction.log(chrome.runtime.lastError.message);
       }
       */
    chrome.identity.getAuthToken({'interactive': false}, function (authToken) {
        if (chrome.runtime.lastError) {
            //refreshUI
            pgaction.log(chrome.runtime.lastError.message);
            return;
        }

        $.ajax(calendar.CALENDAR_LIST_API_URL_, {
            headers: {
                'Authorization': 'Bearer ' + authToken
            },
            success: function(data) {
                var calendars = {};
                for (var i in data.items) {
                    var calendar = data.items[i];

                    var calendarDict = {
                        id: calendar.id,
                        title: calendar.summary,
                        editable: calendar.accessRole == "owner" || calendar.accessRole == "writer",
                        description: calendar.description
                    };

                    calendars[calendar.id] = calendarDict;
                }

                chrome.storage.local.set({"calendars": calendars}, function () {
                    if (chrome.runtime.lastError) {
                        pgaction.log(chrome.runtime.lastError.message);
                        return;
                    }
                });
            },
            error: function (response) {
                if (response.status === 401) {
                    chrome.identity.removeCachedAuthToken({ 'token': authToken }, function() {});
                }
            }
        });
    });
}


