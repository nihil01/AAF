import 'dart:convert';
import 'dart:ui';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:http/http.dart' as http;
import 'package:testapp/utils/storage_data.dart';
import '../dto/friend.dart';
import '../dto/user.dart';
import '../dto/user_data.dart';

String friendsBaseUri = "http://10.20.30.3:8080/api/v1/friends";
String authBaseUri = "http://10.20.30.3:8080/api/v1/auth";

// Универсальный метод для выполнения запросов с обновлением токена
Future<http.Response> makeRequestWithTokenRefresh(
    Uri url,
    Map<String, String> headers,
    Map<String, String> body, {bool isPost = true}) async {
  // Получаем текущий access token
  String? accessToken = await getFromSecStorage("accessToken");
   

  // Выполняем запрос с текущим токеном
  var response;
  if (isPost) {
    response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer $accessToken',
        ...headers,
      },
      body: body,
    );
  } else {
    response = await http.get(
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer $accessToken',
        ...headers,
      },
    );
  }

   

  // Если получен код 401 (неавторизован), обновляем токен
  if (response.statusCode == 401) {
     
    // Обновляем токен и получаем новый напрямую
    accessToken = await updateAccessToken();

    // Если новый токен не получен, возвращаем ошибку
    if (accessToken == null || accessToken.isEmpty) {
       
      throw Exception("Failed to refresh token.");
    }

     

    // Повторяем запрос с новым токеном
    if (isPost) {
      response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer $accessToken',
          ...headers,
        },
        body: body,
      );
    } else {
      response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer $accessToken',
          ...headers,
        },
      );
    }
     
  }

  return response;
}

// Метод для добавления друга
void addFriend(String friendUID) async {
  final url = Uri.parse("$friendsBaseUri/addFriend");

  String? userDataStr = await getFromStorage("USER_DATA");
  if (userDataStr == null) return;

  UserData userData = UserData.fromJson(jsonDecode(userDataStr) as Map<String, dynamic>);

  // Сравниваем, чтобы пользователь был первым в паре, если нужно
  if (userData.friendship_uuid.compareTo(friendUID) > 0) {
    String temp = userData.friendship_uuid;
    userData.friendship_uuid = friendUID;
    friendUID = temp;
  }

  // Параметры запроса
  Map<String, String> body = {
    'friendID': friendUID,
    'userID': userData.friendship_uuid,
  };

  try {
    // Отправляем запрос с токеном
    var response = await makeRequestWithTokenRefresh(
      url,
      {},
      body,
      isPost: true,
    );

    // Обрабатываем ответ
    if (response.statusCode == 200) {
      notifyUserAboutStatus(response.statusCode, "User added to friendlist!");
    } else {
      notifyUserAboutStatus(response.statusCode, "Something went wrong. Maybe invalid code?");
    }
  } catch (e) {
    // Ошибка, если не удалось обновить токен
    notifyUserAboutStatus(401, "Failed to refresh token.");
  }
}

// Метод для получения списка друзей
Future<List<Friend>> getFriends(String userUID) async {
  final url = Uri.parse("$friendsBaseUri/getFriends/$userUID");
  final response = await makeRequestWithTokenRefresh(url, {}, {}, isPost: false);

   

  if (response.statusCode == 200) {
    List<dynamic> jsonResponse = json.decode(response.body);
    return jsonResponse.map((data) => Friend.fromJson(data)).toList();
  } else {
    return [];
  }
}

// Метод аутентификации
Future<bool> authenticate(User user) async {
  final url = Uri.parse("$authBaseUri/authenticate");
  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {
      'email': user.email,
      'password': user.password,
      'username': user.username,
      'type': user.type,
    },
  );

  String? authToken;
  String? refreshToken;

  for (var header in response.headers.entries) {
    if (header.key == 'authorization') {
      authToken = header.value.split(" ")[1];
    }

    if (header.key == 'refresh-token') {
      refreshToken = header.value.split(" ")[1];
    }
  }

  if (authToken != null && refreshToken != null &&
      authToken.isNotEmpty && refreshToken.isNotEmpty) {
    await setToSecStorage("accessToken", authToken);
    await setToSecStorage("refreshToken", refreshToken);
  }

  if (response.statusCode == 200) {
    await setToStorage("USER_DATA", response.body);
    notifyUserAboutStatus(response.statusCode, "Authentication successful!");
    return true;
  } else {
    notifyUserAboutStatus(response.statusCode, "Authentication failure, try again");
    return false;
  }
}

// Метод для удаления друга
void removeFriend(String userID, String friendUID) async {
  final url = Uri.parse("$friendsBaseUri/removeFriend?");
  final Map<String, String> body = {
    'userID': userID,
    'friendID': friendUID,
  };

  try {
    var response = await makeRequestWithTokenRefresh(
      url,
      {},
      body,
      isPost: true,
    );
    notifyUserAboutStatus(response.statusCode, response.body);
  } catch (e) {
    notifyUserAboutStatus(401, "Failed to refresh token.");
  }
}

// Уведомление пользователя о статусе запроса
void notifyUserAboutStatus(int status, String response) {
  if (status == 200) {
    Fluttertoast.showToast(
        msg: response,
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        backgroundColor: const Color.fromARGB(255, 0, 255, 0),
        textColor: const Color.fromARGB(255, 255, 255, 255),
        fontSize: 16.0
    );
  } else {
    Fluttertoast.showToast(
        msg: response,
        toastLength: Toast.LENGTH_SHORT,
        gravity: ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        backgroundColor: const Color.fromARGB(255, 255, 0, 0),
        textColor: const Color.fromARGB(255, 255, 255, 255),
        fontSize: 16.0
    );
  }
}

// No, this is not a valid regex to replace all print statements.
// To match print statements, you would want something like:
// print\(.*\);
// This will match print() with any content inside the parentheses followed by a semicolon





// Обновление токена
Future<String?> updateAccessToken() async {
  final url = Uri.parse("$authBaseUri/refresh");
  final String? refreshToken = await getFromSecStorage("refreshToken");

  if (refreshToken == null || refreshToken.isEmpty) {
     
    throw Exception("No refresh token available");
  }

   

  final response = await http.get(
    url,
    headers: {
      'Authorization': 'Bearer $refreshToken',
    },
  );

  if (response.statusCode == 200) {
    String? authToken;
     

    for (var header in response.headers.entries) {
      if (header.key == 'authorization') {
        authToken = header.value.split(" ")[1];
         
      }
    }

    if (authToken != null && authToken.isNotEmpty) {
      // Сохраняем новый токен в secure storage
      await setToSecStorage("accessToken", authToken);
       
      return authToken; // Возвращаем токен напрямую
    } else {
      throw Exception("Failed to retrieve auth token.");
    }
  } else {
     
    throw Exception("Failed to refresh token");
  }
}