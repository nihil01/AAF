import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:testapp/utils/storage_data.dart';
import '../dto/usercords.dart';
import '../utils/locator.dart';


Future<BitmapDescriptor> generateIcon(String path) {
  return BitmapDescriptor.asset(
      const ImageConfiguration(size: Size(24, 24), devicePixelRatio: 2.5), path
  );
}

// Получение текущей геолокации и преобразование в LatLng
Future<LatLng> retrieveInitialCords() async {
  try {
    Position cords = await determinePosition();
    return LatLng(cords.latitude, cords.longitude);
  } catch (e) {
    rethrow; // пробрасываем исключение дальше
  }
}

// Глобальная переменная для хранения будущих координат
Future<LatLng>? _initialCordsFuture;

class GoogleMapCars extends StatefulWidget {
  const GoogleMapCars({Key? key}) : super(key: key);

  @override
  State<GoogleMapCars> createState() => InitialState();
}

class InitialState extends State<GoogleMapCars> {
  final ValueNotifier<bool> isSwitchedNotifier = ValueNotifier(false);

  void _switchListener() async {
    if (isSwitchedNotifier.value) {
      // Если включили, проверяем разрешения
      if (!locationNotifier.status) {
        isSwitchedNotifier.value = false;
        setToStorage("location_shared", "0");
        Fluttertoast.showToast(
          msg: locationNotifier.message,
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
        return;
      }

      // Старт фонового сервиса
      try {
        await wrapBroadcastingInForegroundService();
        Fluttertoast.showToast(
          msg: "Вы сейчас делитесь геопозицией в реальном времени!",
          backgroundColor: Colors.green,
          textColor: Colors.white,
        );
      } catch (e) {
        isSwitchedNotifier.value = false;
        setToStorage("location_shared", "0");
        Fluttertoast.showToast(
          msg: e.toString(),
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
      }
    } else {
      // Останов сервиса
      Fluttertoast.showToast(
        msg: "Вы больше не делитесь геопозицией.",
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      stopForegroundLocationService();
    }
  }

  @override
  void initState() {
    super.initState();

    // Проверка прав доступа к геолокации
    initializeLocationState().then((_) {
      if (!locationNotifier.status) {
        isSwitchedNotifier.value = false;
        setToStorage("location_shared", "0");
        Fluttertoast.showToast(
          msg: locationNotifier.message,
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );


      } else {
        _initialCordsFuture = retrieveInitialCords();
      }
    });

    _loadSwitchState();
    isSwitchedNotifier.addListener(_switchListener);
    FlutterForegroundTask.addTaskDataCallback(_onReceiveTaskData);
  }

  void _onReceiveTaskData(Object data) {
    if (data is Map<String, dynamic>) {
      final cords = UserCords.fromJson(data);
      print("✅ Получены координаты: ${cords.latitude}, ${cords.longitude}");

      if (cords.latitude > 0 && cords.longitude > 0 && cords.userId.isNotEmpty) {
        addMarker(
          LatLng(cords.latitude, cords.longitude),
          cords.userId,
          'My Location',
          '',
          'lib/assets/manager.png',
        );
      }
    } else {
      print("⚠️ Получены данные в неожиданном формате: $data");
    }
  }

  @override
  void dispose() {
    FlutterForegroundTask.removeTaskDataCallback(_onReceiveTaskData);
    isSwitchedNotifier.removeListener(_switchListener);
    super.dispose();
  }

  // Загрузка сохраненного состояния переключателя
  Future<void> _loadSwitchState() async {
    String data = await getFromStorage("location_shared") ?? "0";
    if (!mounted) return;

    setState(() {
      isSwitchedNotifier.value = (data == "1");
    });
  }

  GoogleMapController? mapController;
  Set<Marker> markers = {};

  void addMarker(LatLng position, String id, String title, String snippet, String? iconPath) async {
    final marker = Marker(
      markerId: MarkerId(id),
      position: position,
      infoWindow: InfoWindow(title: title, snippet: snippet),
      icon: iconPath != null ? await generateIcon(iconPath) : BitmapDescriptor.defaultMarker,
    );

    setState(() {
      markers.add(marker);
    });
  }

  void removeMarker(String id) {
    setState(() {
      markers.removeWhere((marker) => marker.markerId.value == id);
    });
  }

  void clearMarkers() {
    setState(() {
      markers.clear();
    });
  }

  Future<LatLng> initializeMarker() async {
    LatLng cords = await retrieveInitialCords();

    addMarker(
      cords,
      'marker_initial_spawn',
      'Место спавна',
      '',
      'lib/assets/police.png',
    );
    return cords;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('bibiki'),
        elevation: 2,
        actions: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Text("Делиться локацией?"),
          ),
          ValueListenableBuilder(
            valueListenable: isSwitchedNotifier,
            builder: (context, value, child) {
              return Switch(
                value: value,
                onChanged: (newValue) {
                  isSwitchedNotifier.value = newValue;
                  setToStorage("location_shared", newValue ? "1" : "0");
                },
                activeTrackColor: Colors.lightGreenAccent,
                activeColor: Colors.green,
              );
            },
          ),
        ],
      ),
      body: _initialCordsFuture == null ?
      Center(child: Icon(Icons.near_me_disabled, size: 50))
      :FutureBuilder<LatLng>(
        future: _initialCordsFuture,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Ошибка определения местоположения:\n${snapshot.error}',
                textAlign: TextAlign.center,
              ),
            );
          }

          if (snapshot.hasData) {
            return GoogleMap(
              initialCameraPosition: CameraPosition(
                target: snapshot.data!,
                zoom: 16,
              ),
              markers: markers,
              onMapCreated: (GoogleMapController controller) {
                mapController = controller;
                initializeMarker();
              },
              onTap: (LatLng position) {
                addMarker(
                  position,
                  'marker_desired_loc',
                  'Chosen Location',
                  'Geoposition: ${position.latitude.toStringAsFixed(2)}, ${position.longitude.toStringAsFixed(2)}',
                  null,
                );
              },
            );
          }

          return Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}
