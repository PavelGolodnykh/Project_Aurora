// qml/js/ScheduleManager.js
.pragma library
.import QtQuick.LocalStorage 2.0 as Sql

function ScheduleManager() {
    this.BASE_URL = "https://ruz.fa.ru/api/schedule/group/";
    this.db = null;

    this.initDatabase = function() {
        if (this.db) return;

        this.db = Sql.LocalStorage.openDatabaseSync("ScheduleDB", "1.0", "Schedule Database", 1000000);

        this.db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS lessons (id INTEGER PRIMARY KEY AUTOINCREMENT, dayOfWeek TEXT, beginLesson TEXT, endLesson TEXT, kindOfWork TEXT, discipline TEXT, lecturer TEXT, auditorium TEXT, building TEXT, groupName TEXT, date TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
        });

        console.log("Database initialized");
    };


    this.clearLessons = function() {
        this.initDatabase();

        this.db.transaction(function(tx) {
            tx.executeSql('DELETE FROM lessons');
        });

        console.log("Lessons table cleared");
    };

    this.saveLesson = function(lesson) {
        this.initDatabase();

        this.db.transaction(function(tx) {
            tx.executeSql(
                'INSERT INTO lessons (dayOfWeek, beginLesson, endLesson, kindOfWork, discipline, lecturer, auditorium, building, groupName, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    lesson.dayOfWeek || "",
                    lesson.beginLesson || "",
                    lesson.endLesson || "",
                    lesson.kindOfWork || "",
                    lesson.discipline || "",
                    lesson.lecturer || "",
                    lesson.auditorium || "",
                    lesson.building || "",
                    lesson.group || "",
                    lesson.date || ""
                ]
            );
        });
    };

    this.saveLessons = function(lessons) {
        this.initDatabase();
        this.clearLessons();

        for (var i = 0; i < lessons.length; i++) {
            this.saveLesson(lessons[i]);
        }

        console.log("Saved " + lessons.length + " lessons to database");
    };

    this.getAllLessons = function() {
        this.initDatabase();

        var lessons = [];

        this.db.readTransaction(function(tx) {
            var result = tx.executeSql('SELECT * FROM lessons ORDER BY date, beginLesson');

            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows.item(i);
                lessons.push({
                    dayOfWeek: row.dayOfWeek,
                    beginLesson: row.beginLesson,
                    endLesson: row.endLesson,
                    kindOfWork: row.kindOfWork,
                    discipline: row.discipline,
                    lecturer: row.lecturer,
                    auditorium: row.auditorium,
                    building: row.building,
                    group: row.groupName,
                    date: row.date
                });
            }
        });

        console.log("Retrieved " + lessons.length + " lessons from database");
        return lessons;
    };

    this.getLessonsCount = function() {
        this.initDatabase();

        var count = 0;

        this.db.readTransaction(function(tx) {
            var result = tx.executeSql('SELECT COUNT(*) as count FROM lessons');
            if (result.rows.length > 0) {
                count = result.rows.item(0).count;
            }
        });

        return count;
    };

    this.loadFromDatabase = function(textArea, page) {
        var lessons = this.getAllLessons();

        if (lessons.length === 0) {
            textArea.text = "База данных пуста. Загрузите расписание из интернета.";
            page.statusMessage = "БД пуста";
            return;
        }

        var formattedText = "Загружено из БД: " + lessons.length + " занятий\n\n";

        for (var i = 0; i < lessons.length; i++) {
            var lesson = lessons[i];
            formattedText += "━━━━━━━━━━━━━━━━━━━━\n";
            formattedText += "📅 " + (lesson.dayOfWeek || "—") + " | ";
            formattedText += (lesson.beginLesson || "—") + " - " + (lesson.endLesson || "—") + "\n";
            formattedText += "📚 " + (lesson.discipline || "—") + "\n";
            formattedText += "👨‍🏫 " + (lesson.lecturer || "—") + "\n";
            formattedText += "📝 " + (lesson.kindOfWork || "—") + "\n";
            formattedText += "🏢 " + (lesson.auditorium || "—") + "\n";
            formattedText += "🏛️ " + (lesson.building || "—") + "\n";
            if (lesson.group) {
                formattedText += "👥 Группа: " + lesson.group + "\n";
            }
            formattedText += "\n";
        }

        textArea.text = formattedText;
        page.statusMessage = "Загружено из БД: " + lessons.length + " занятий";
    };


    this.loadSchedule = function(groupId, textArea, busyIndicator, page) {
        var currentDate = new Date();
        var startDate = new Date(currentDate);
        var day = startDate.getDay();
        var diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);

        var finishDate = new Date(startDate);
        finishDate.setDate(startDate.getDate() + 6);

        var startStr = this._formatDate(startDate);
        var finishStr = this._formatDate(finishDate);

        var url = this.BASE_URL + groupId +
                  "?start=" + startStr + "&finish=" + finishStr;

        this._makeRequest(url, textArea, busyIndicator, page);
    };

    this._formatDate = function(date) {
        var year = date.getFullYear();
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        var day = ('0' + date.getDate()).slice(-2);
        return year + '-' + month + '-' + day;
    };

    this._makeRequest = function(url, textArea, busyIndicator, page) {
        var self = this;
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                busyIndicator.running = false;

                if (xhr.status === 200) {
                    try {
                        var jsonResponse = xhr.responseText;
                        var parsedJson = JSON.parse(jsonResponse);

                        var formattedText = "";
                        if (Array.isArray(parsedJson)) {
                            var lessonsToSave = [];

                            formattedText = "Найдено занятий: " + parsedJson.length + "\n\n";

                            for (var i = 0; i < parsedJson.length; i++) {
                                var lesson = parsedJson[i];

                                lessonsToSave.push({
                                    dayOfWeek: lesson.dayOfWeekString || "",
                                    beginLesson: lesson.beginLesson || "",
                                    endLesson: lesson.endLesson || "",
                                    kindOfWork: lesson.kindOfWork || "",
                                    discipline: lesson.discipline || "",
                                    lecturer: lesson.lecturer || "",
                                    auditorium: lesson.auditorium || "",
                                    building: lesson.building || "",
                                    group: lesson.group || "",
                                    date: lesson.date || ""
                                });

                                formattedText += "━━━━━━━━━━━━━━━━━━━━\n";
                                formattedText += "📅 " + (lesson.dayOfWeekString || "—") + " | ";
                                formattedText += (lesson.beginLesson || "—") + " - " + (lesson.endLesson || "—") + "\n";
                                formattedText += "📚 " + (lesson.discipline || "—") + "\n";
                                formattedText += "👨‍🏫 " + (lesson.lecturer || "—") + "\n";
                                formattedText += "📝 " + (lesson.kindOfWork || "—") + "\n";
                                formattedText += "🏢 " + (lesson.auditorium || "—") + "\n";
                                formattedText += "🏛️ " + (lesson.building || "—") + "\n";
                                if (lesson.group) {
                                    formattedText += "👥 Группа: " + lesson.group + "\n";
                                }
                                formattedText += "\n";
                            }


                            self.saveLessons(lessonsToSave);

                            textArea.text = formattedText;
                            page.statusMessage = "Загружено и сохранено: " + parsedJson.length + " занятий";
                        } else {
                            textArea.text = "Нет данных для отображения";
                            page.statusMessage = "Нет данных";
                        }
                    } catch (e) {
                        textArea.text = "Ошибка обработки данных: " + e.toString();
                        page.statusMessage = "Ошибка данных";
                        console.log("Error:", e);
                    }
                } else if (xhr.status === 0) {
                    textArea.text = "Сетевая ошибка. Проверьте интернет.";
                    page.statusMessage = "Сетевая ошибка";
                } else {
                    textArea.text = "Ошибка " + xhr.status + ": " + xhr.statusText;
                    page.statusMessage = "Ошибка " + xhr.status;
                }

                if (page.clearStatusTimer) {
                    page.clearStatusTimer.interval = 2000;
                    page.clearStatusTimer.restart();
                }
            }
        };

        xhr.onerror = function() {
            busyIndicator.running = false;
            textArea.text = "Ошибка сети";
            page.statusMessage = "Ошибка сети";
            if (page.clearStatusTimer) {
                page.clearStatusTimer.interval = 2000;
                page.clearStatusTimer.restart();
            }
        };

        xhr.open("GET", url);
        xhr.timeout = 10000;
        xhr.send();
    };
}

var scheduleManager = new ScheduleManager();
