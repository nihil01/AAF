import 'dart:async';
import 'dart:convert';

import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:geolocator/geolocator.dart';
import 'package:testapp/net/websocket_client.dart';
import 'package:testapp/utils/storage_data.dart';

import '../dto/user_data.dart';
import '../dto/usercords.dart';

@pragma('vm:entry-point')
void startCallback() {
  FlutterForegroundTask.setTaskHandler(MyTaskHandler());
}


class MyTaskHandler extends TaskHandler {
  StreamSubscription<Position>? _positionSubscription;


@override
Future<void> onStart(DateTime timestamp, TaskStarter starter) async {
  try {
    print('STARTING STREAMING');
    var userData = UserData.fromJson(jsonDecode(await getFromStorage("USER_DATA") ?? "{}"));

    var coordinates = UserCords.empty();
    coordinates.setuserId(userData.friendship_uuid);

    String? broadcastInitialized = await FlutterForegroundTask.getData<String>(key: 'BROADCAST_INITIALIZED');
    print("Broadcast data: " + broadcastInitialized.toString());
    if (broadcastInitialized == "false" || broadcastInitialized == null) {
      coordinates.setType("init");
      await FlutterForegroundTask.saveData(key: "BROADCAST_INITIALIZED", value: "true");
    } else {
      coordinates.setType("broadcast");
    }

    _positionSubscription = Geolocator.getPositionStream().listen((position) {
      print('position: ${position.toString()}');

      coordinates.setLatitude(position.latitude);
      coordinates.setLongitude(position.longitude);

      sendData(coordinates);
      FlutterForegroundTask.sendDataToMain(coordinates.toJson());
    });
  } catch (e) {
    print("🚨 onStart crash: $e");
  }
}

  // Called based on the eventAc
  @override
  void onRepeatEvent(DateTime timestamp) {
    // Send data to main isolate.
    final Map<String, dynamic> data = {
      "timestampMillis": timestamp.millisecondsSinceEpoch,
    };
    FlutterForegroundTask.sendDataToMain(data);
  }

  // Called when the task is destroyed.
  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {
    print('🔴 ForegroundService stopped at $timestamp (timeout=$isTimeout)');
    await _positionSubscription?.cancel();
  }

  // Called when data is sent using `FlutterForegroundTask.sendDataToTask`.
  @override
  void onReceiveData(Object data) {
    print('📨 Received data in TaskHandler: $data');
  }

  // Called when the notification button is pressed.
  @override
  void onNotificationButtonPressed(String id) {
    print('onNotificationButtonPressed: $id');
  }

  // Called when the notification itself is pressed.
  @override
  void onNotificationPressed() {
    print('onNotificationPressed');
  }

  // Called when the notification itself is dismissed.
  @override
  void onNotificationDismissed() {
    print('onNotificationDismissed');
  }

}