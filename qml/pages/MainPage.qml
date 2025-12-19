import QtQuick 2.0
import Sailfish.Silica 1.0
import "../js/ScheduleManager.js" as ScheduleManager

Page {
    id: page
    backgroundColor: "#8B008B"
    allowedOrientations: Orientation.All

    PageHeader {
        id: header
        title: "Расписание ФА"
        description: page.statusMessage || "Введите ID группы"
    }

    Column {
        id: column
        width: page.width
        anchors.top: header.bottom
        anchors.topMargin: Theme.paddingLarge
        spacing: Theme.paddingLarge

        TextField {
            id: groupIdField
            width: parent.width - 2 * Theme.horizontalPageMargin
            anchors.horizontalCenter: parent.horizontalCenter
            placeholderText: "Введите ID группы"
            label: "ID группы"
            inputMethodHints: Qt.ImhDigitsOnly

            EnterKey.iconSource: "image://theme/icon-m-enter-next"
            EnterKey.onClicked: {
                groupIdField.focus = false
                downloadButton.focus = true
            }
        }

        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Theme.paddingMedium

            Button {
                id: downloadButton
                text: "Загрузить"

                onClicked: {
                    if (groupIdField.text.trim() !== "") {
                        busyIndicator.running = true
                        jsonText.text = "Загрузка..."
                        page.statusMessage = "Загрузка..."

                        ScheduleManager.scheduleManager.loadSchedule(
                            groupIdField.text.trim(),
                            jsonText,
                            busyIndicator,
                            page
                        )
                    } else {
                        page.statusMessage = "Введите ID группы"
                        clearStatusTimer.interval = 2000
                        clearStatusTimer.restart()
                    }
                }
            }

            Button {
                id: loadFromDbButton
                text: "Из БД"

                onClicked: {
                    jsonText.text = "Загрузка из базы данных..."
                    page.statusMessage = "Загрузка из БД..."

                    ScheduleManager.scheduleManager.loadFromDatabase(
                        jsonText,
                        page
                    )

                    if (page.clearStatusTimer) {
                        page.clearStatusTimer.interval = 2000
                        page.clearStatusTimer.restart()
                    }
                }
            }
        }

        SilicaFlickable {
            id: jsonFlickable
            width: parent.width
            height: page.height - column.y - 150
            anchors.horizontalCenter: parent.horizontalCenter
            contentHeight: jsonText.height

            TextArea {
                id: jsonText
                width: parent.width - 2 * Theme.horizontalPageMargin
                anchors.horizontalCenter: parent.horizontalCenter
                readOnly: true
                placeholderText: "Здесь будет расписание"
                font.pixelSize: Theme.fontSizeExtraSmall
                color: Theme.highlightColor
                wrapMode: Text.Wrap
                text: "Введите ID группы и нажмите 'Загрузить расписание'"
            }

            VerticalScrollDecorator {}
        }
    }

    BusyIndicator {
        id: busyIndicator
        size: BusyIndicatorSize.Large
        anchors.centerIn: parent
        running: false
    }

    property string statusMessage: ""

    Timer {
        id: clearStatusTimer
        onTriggered: {
            page.statusMessage = ""
        }
    }
}
