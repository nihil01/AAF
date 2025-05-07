class User{

  final String type;
  final String username;
  final String email;
  final String password;

  User(this.type, this.username, this.email, this.password);

  User.fromJson(Map<String, dynamic> map)
      : type = map['type'],
        username = map['username'],
        email = map['email'],
        password = map['password'];

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'username': username,
      'email': email,
      'password': password,
    };
  }

}