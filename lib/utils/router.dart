import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:testapp/pages/auth/sign_in.dart';
import 'package:testapp/pages/google_map_cars.dart';
import 'package:testapp/utils/storage_data.dart';
import '../pages/friends_page.dart';

void main() {
  // WidgetsFlutterBinding.ensureInitialized();
  FlutterForegroundTask.initCommunicationPort();

  FlutterForegroundTask.init(
    androidNotificationOptions: AndroidNotificationOptions(
      channelId: 'geo_service',
      channelName: 'Geolocation Streaming',
      channelDescription:
      'This notification appears when the geolocation streaming is on.',
      onlyAlertOnce: false,
      channelImportance: NotificationChannelImportance.HIGH,
    ),
    iosNotificationOptions: const IOSNotificationOptions(
      showNotification: true,
      playSound: false,
    ),
    foregroundTaskOptions: ForegroundTaskOptions(
      eventAction: ForegroundTaskEventAction.repeat(5000),
      autoRunOnBoot: false,
      autoRunOnMyPackageReplaced: false,
      allowWakeLock: true,
      allowWifiLock: true,
    ),
  );

  runApp(AuthWidget());
}

class AuthWidget extends StatelessWidget {
  const AuthWidget({super.key});

  Future<bool> checkAuth() async {
    String? authStatus = await getFromStorage("USER_DATA");
    return authStatus != null;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: FutureBuilder<bool>(
        future: checkAuth(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (snapshot.data == true) {
            return const MyHomePage();

          } else {
            return const OnBoardingPage();

          }
        },
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    FirstPage(),
    GoogleMapCars(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.garage),
            label: "Главная страница",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: "Карта машин",
          )
        ],
      ),
    );
  }
}