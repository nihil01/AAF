import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

final storageSec = FlutterSecureStorage();

// Чтение из SharedPreferences
Future<String?> getFromStorage(String key) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString(key);
}


// Чтение из Secure Storage
Future<String?> getFromSecStorage(String key) async {
  return await storageSec.read(key: key);
}

//================================================

// Запись в SharedPreferences
Future<void> setToStorage(String key, String value) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(key, value);
}

// Запись в Secure Storage
Future<void> setToSecStorage(String key, String value) async {
  await storageSec.write(key: key, value: value);
}

// Удаление из SharedPreferences
Future<void> removeFromStorage(String key) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.remove(key);
}

// Удаление из Secure Storage
Future<void> removeFromSecStorage(String key) async {
  await storageSec.delete(key: key);
}