import QtQuick 2.0
import Sailfish.Silica 1.0

BackgroundItem {
    id: lessonCard

    property string dayOfWeek: ""
    property string beginLesson: ""
    property string endLesson: ""
    property string kindOfWork: ""
    property string discipline: ""
    property string lecturer: ""
    property string auditorium: ""
    property string building: ""
    property string group: ""

    width: parent.width
    height: contentColumn.height + 2 * Theme.paddingMedium

    Rectangle {
        anchors.fill: parent
        color: Theme.rgba(Theme.highlightBackgroundColor, 0.1)
        radius: Theme.paddingSmall
    }

    Column {
        id: contentColumn
        anchors {
            left: parent.left
            right: parent.right
            top: parent.top
            margins: Theme.paddingMedium
        }
        spacing: Theme.paddingSmall

        // Время и день недели
        Row {
            width: parent.width
            spacing: Theme.paddingMedium

            Label {
                text: lessonCard.dayOfWeek
                font.pixelSize: Theme.fontSizeMedium
                font.bold: true
                color: Theme.highlightColor
            }

            Label {
                text: lessonCard.beginLesson + " - " + lessonCard.endLesson
                font.pixelSize: Theme.fontSizeMedium
                color: Theme.primaryColor
            }
        }

        // Тип занятия
        Label {
            width: parent.width
            text: lessonCard.kindOfWork
            font.pixelSize: Theme.fontSizeSmall
            color: Theme.secondaryHighlightColor
            wrapMode: Text.WordWrap
        }

        // Дисциплина
        Label {
            width: parent.width
            text: lessonCard.discipline
            font.pixelSize: Theme.fontSizeMedium
            font.bold: true
            color: Theme.primaryColor
            wrapMode: Text.WordWrap
        }

        // Преподаватель
        Row {
            width: parent.width
            spacing: Theme.paddingSmall

            Image {
                source: "image://theme/icon-s-person"
                width: Theme.iconSizeSmall
                height: Theme.iconSizeSmall
            }

            Label {
                text: lessonCard.lecturer
                font.pixelSize: Theme.fontSizeSmall
                color: Theme.primaryColor
                width: parent.width - Theme.iconSizeSmall - Theme.paddingSmall
                wrapMode: Text.WordWrap
            }
        }

        // Аудитория и корпус
        Row {
            width: parent.width
            spacing: Theme.paddingSmall

            Image {
                source: "image://theme/icon-s-home"
                width: Theme.iconSizeSmall
                height: Theme.iconSizeSmall
            }

            Column {
                width: parent.width - Theme.iconSizeSmall - Theme.paddingSmall

                Label {
                    text: "Аудитория: " + lessonCard.auditorium
                    font.pixelSize: Theme.fontSizeSmall
                    color: Theme.primaryColor
                    wrapMode: Text.WordWrap
                }

                Label {
                    text: lessonCard.building
                    font.pixelSize: Theme.fontSizeExtraSmall
                    color: Theme.secondaryColor
                    wrapMode: Text.WordWrap
                }
            }
        }

        // Группа (если есть)
        Row {
            width: parent.width
            spacing: Theme.paddingSmall
            visible: lessonCard.group !== ""

            Image {
                source: "image://theme/icon-s-group-chat"
                width: Theme.iconSizeSmall
                height: Theme.iconSizeSmall
            }

            Label {
                text: "Группа: " + lessonCard.group
                font.pixelSize: Theme.fontSizeSmall
                color: Theme.primaryColor
            }
        }
    }
}
