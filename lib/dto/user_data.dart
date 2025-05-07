class UserData{

  final String email;
  final String username;
  final String registered;
  final bool success;
  String friendship_uuid;

  UserData(this.email, this.username, this.registered, this.success, this.friendship_uuid);

  UserData.fromJson(Map<String, dynamic> json)
    : email = json['email'],
      username = json['username'],
      registered = json['registered'],
      success = json['success'],
      friendship_uuid = json['friendship_uuid'];

  Map<String, dynamic> toJson() => {
    'email': email,
    'username': username,
    'registered': registered,
    'success': success,
    'friendship_uuid': friendship_uuid
  };

  setfriendship_uuid(String friendshipUuid) {
    this.friendship_uuid = friendshipUuid;
  }

}