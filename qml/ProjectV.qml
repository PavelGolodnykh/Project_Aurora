import QtQuick 2.0
import Sailfish.Silica 1.0

ApplicationWindow {
    id: appWindow

    initialPage: Qt.createComponent(Qt.resolvedUrl("pages/MainPage.qml")).createObject(appWindow)
    cover: Qt.resolvedUrl("cover/CoverPage.qml")
    allowedOrientations: Orientation.All
}
