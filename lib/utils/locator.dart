import 'dart:async';
import 'dart:ui';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:geolocator/geolocator.dart';
import 'package:testapp/utils/location_event_notify.dart';
import 'package:testapp/utils/storage_data.dart';
import 'foreground_service.dart';

LocationNotifier locationNotifier = LocationNotifier(status: true, message: "");

Future<LocationNotifier> initializeLocationState() async {

  bool serviceEnabled;
  LocationPermission permission;

  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    locationNotifier.status = false;
    locationNotifier.message = "Location services are disabled.";
    return locationNotifier;
  }

  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      locationNotifier.status = false;
      locationNotifier.message = "Location permissions are denied";
      return locationNotifier;
    }
  }

  if (permission == LocationPermission.deniedForever) {
    locationNotifier.status = false;
    locationNotifier.message = "Location permissions are permanently denied,"
        " turn them on in Settings.";
    return locationNotifier;
  }

  return locationNotifier;
}

Future<void> getNotificationPermission() async{
  NotificationPermission notificationPermission = await FlutterForegroundTask.checkNotificationPermission();

  if (notificationPermission != NotificationPermission.granted) {
    await FlutterForegroundTask.requestNotificationPermission();

    notificationPermission = await FlutterForegroundTask.checkNotificationPermission();
  }

  if(notificationPermission == NotificationPermission.permanently_denied){
    throw Exception("Notification permission permanently denied."
        " You can still allow it in settings");
  }
  else if(notificationPermission == NotificationPermission.denied){
    throw Exception("Notification permission denied.");
  }

}

Future<Position> determinePosition() async {
  if (!locationNotifier.status) {
    throw Exception(locationNotifier.message);
  }

  return await Geolocator.getCurrentPosition();
}

Future<void> wrapBroadcastingInForegroundService() async {
  try   {
    if (!locationNotifier.status) {
      throw Exception(locationNotifier.message);
    }

    await getNotificationPermission();

    await FlutterForegroundTask.startService(
      serviceId: 256,
      notificationIcon: const NotificationIcon(
        metaDataName: "custom_notification_icon",
        backgroundColor: Color.fromARGB(0, 255, 0, 0)
      ),
      notificationInitialRoute: '/',
      notificationTitle: 'Geolocation Streaming',
      notificationText: 'Сервис активен',
      callback: startCallback,
    );

  } catch (e) {
    rethrow; // Re-throw exception to be handled by UI
  }
}

void stopForegroundLocationService() async {
  await FlutterForegroundTask.clearAllData();
  print("📴 Broadcast location cleared.YO.");

  await FlutterForegroundTask.saveData(key: "BROADCAST_INITIALIZED", value: "false");

  await FlutterForegroundTask.stopService();
  print("📴 Broadcast location stopped.");
}


