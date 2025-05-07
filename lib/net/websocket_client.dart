import 'dart:convert';
import 'package:testapp/utils/storage_data.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/status.dart' as status;
import 'package:web_socket_channel/web_socket_channel.dart';

WebSocketChannel? _channel;
bool connected = false;

/// Подключение к WebSocket-серверу
Future<void> connect() async {
  if (connected && _channel != null) {
    print("Уже подключено");
    return;
  }

  final Uri address = Uri.parse("ws://10.20.30.3:8080/api/v1/socket");

  try {
    _channel = IOWebSocketChannel.connect(address);
    print(_channel?.closeCode);

    connected = true;

    print("Подключено к серверу!");

    _channel!.stream.listen(
          (event) {
        print("Получено сообщение от сервера: $event");

      },
      onError: (error) {
        print("Ошибка соединения: $error");
        connected = false;
      },
      onDone: () {
        print("Соединение закрыто сервером");
        connected = false;
      },
      cancelOnError: true,
    );
  } catch (e) {
    print("Ошибка подключения: $e");
    connected = false;
  }
}
/// Отправка данных на сервер
Future<void> sendData(dynamic data) async {
  if (!connected || _channel == null) {
    await connect();
  }

  try {
    final jsonData = jsonEncode(data); // сериализация
    print("Отправка данных: $jsonData");
    _channel?.sink.add(jsonData);
  } catch (e) {
    print("Ошибка отправки данных: $e");
  }
}

/// Закрытие соединения
void closeConnection() {
  if (_channel != null) {
    _channel!.sink.close(status.normalClosure);
    print("Соединение закрыто вручную.");
  }

  _channel = null;
  connected = false;
}
