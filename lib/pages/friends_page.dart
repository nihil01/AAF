import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:testapp/dto/user_data.dart';
import 'package:testapp/net/http_client.dart';
import 'package:testapp/utils/storage_data.dart';

import '../dto/friend.dart';
import 'auth/sign_in.dart';

class FirstPage extends StatefulWidget {
  const FirstPage({super.key});

  @override
  State<FirstPage> createState() => FirstPageState();
}

class FirstPageState extends State<FirstPage> {
  final TextEditingController _controller = TextEditingController();
  final List<Friend> _friends = [];

  @override
  void initState() {
    super.initState();
    _controller.text = "#";
    _controller.addListener(() {
      final text = _controller.text;

      if (!text.startsWith("#")) {
        _controller.text = "#${text.replaceAll("#", "").toUpperCase()}";
        _controller.selection = TextSelection.fromPosition(
          TextPosition(offset: _controller.text.length),
        );
      } else {
        final newText = "#${text.substring(1).toUpperCase()}";
        if (newText != text) {
          _controller.text = newText;
          _controller.selection = TextSelection.fromPosition(
            TextPosition(offset: newText.length),
          );
        }
      }
    });
    _getFriends();
  }

  void _getFriends() async {
    // Используйте await для получения значения из Future
    String? userDataStr = await getFromStorage("USER_DATA");

    // Проверяем, что значение не равно null, прежде чем продолжать
    if (userDataStr != null) {
      UserData userData = UserData.fromJson(jsonDecode(userDataStr) as Map<String, dynamic>);
      final List<Friend> friends = await getFriends(userData.friendship_uuid);
      print(friends);
      setState(() {
        _friends.clear();
        _friends.addAll(friends);
      });
    } else {
      // Обрабатываем случай, когда данные не получены
      print('User data not found');
    }
  }


  void _logout() async{
    removeFromStorage("USER_DATA");
    removeFromSecStorage("accessToken");
    removeFromSecStorage("refreshToken");

    Navigator.pushReplacement(context,
        MaterialPageRoute(builder: (context) => const SignInPage()));

  }

  void _addFriend() {
    final name = _controller.text.trim().substring(1);
    if (name.isNotEmpty) {
      setState(() {
        _controller.clear();
      });
      addFriend(name);
    }
  }

void _removeFriend(int index) async {
    String? userDataStr = await getFromStorage("USER_DATA");
    if (userDataStr != null) {
      UserData userData = UserData.fromJson(jsonDecode(userDataStr) as Map<String, dynamic>);
      print("MY UUID IS " + userData.friendship_uuid);
      removeFriend(userData.friendship_uuid, _friends.elementAt(index).friendship_uuid);
      setState(() {
        _friends.removeAt(index);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Список друзей")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Форма для ввода имени
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      labelText: "Имя друга",
                      border: OutlineInputBorder(),
                    ),
                    inputFormatters: [
                      LengthLimitingTextInputFormatter(9),
                      FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addFriend,
                  child: Text("Добавить"),
                ),
              ],
            ),
            ElevatedButton(
              onPressed: () {
                _logout();
              },
              child: const Text("Выйти из аккаунта")
            ),
            const SizedBox(height: 20),
            // Список друзей
            Expanded(
              child: _friends.isEmpty
                  ? Center(child: Text("Список друзей пуст"))
                  : ListView.builder(
                itemCount: _friends.length,
                itemBuilder: (context, index) {
              return Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.blue[100],
                        child: Text(_friends[index].username[0]),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _friends[index].username,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Registered since: ${_friends[index].registered.toIso8601String().substring(0, 10)}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600]
                              ),
                            ),
                            Text(
                              'ID: ${_friends[index].friendship_uuid}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600]
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _removeFriend(index),
                      ),
                    ],
                  ),
                ),
              );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

